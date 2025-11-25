import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import api from '../api/client';

const BookingPage = () => {
    const { mentorId } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { register, handleSubmit } = useForm();
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

    const { data: mentor } = useQuery({
        queryKey: ['mentor', mentorId],
        queryFn: async () => {
            const res = await api.get(`/mentors/${mentorId}`);
            return res.data;
        }
    });

    const { data: availableSlots, isLoading: isLoadingSlots } = useQuery({
        queryKey: ['slots', mentorId, selectedDate],
        queryFn: async () => {
            const res = await api.get(`/mentors/${mentorId}/slots?date=${selectedDate}`);
            return res.data as string[];
        },
        enabled: !!mentorId && !!selectedDate
    });

    const createSession = useMutation({
        mutationFn: async (data: any) => {
            return await api.post('/sessions', data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sessions'] });
            navigate('/dashboard');
        }
    });

    const onSubmit = (data: any) => {
        if (!selectedSlot || !mentor) return;
        createSession.mutate({
            mentorId: mentor.userId._id,
            startAt: selectedSlot,
            agenda: data.agenda
        });
    };

    if (!mentor) return <div>Loading...</div>;

    return (
        <div className="min-h-screen bg-neutral-softGray p-8 flex justify-center">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-2xl">
                <h2 className="text-3xl font-heading font-bold mb-6">Book a Session with {mentor.userId.name}</h2>

                <div className="mb-8">
                    <h3 className="text-xl font-bold mb-4">Select a Date & Time</h3>

                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="mb-6 p-2 border border-gray-300 rounded-lg w-full"
                        min={new Date().toISOString().split('T')[0]}
                    />

                    {isLoadingSlots ? (
                        <p>Loading slots...</p>
                    ) : availableSlots && availableSlots.length > 0 ? (
                        <div className="grid grid-cols-3 gap-4">
                            {availableSlots.map((slot) => (
                                <button
                                    key={slot}
                                    onClick={() => setSelectedSlot(slot)}
                                    className={`p-3 rounded-lg border transition-all ${selectedSlot === slot ? 'bg-primary text-white border-primary shadow-md' : 'border-gray-300 hover:border-primary hover:bg-blue-50'}`}
                                >
                                    {new Date(slot).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </button>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 italic">No slots available for this date.</p>
                    )}
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-neutral-charcoal mb-1">Agenda / Topic</label>
                        <textarea
                            {...register('agenda', { required: true })}
                            className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary outline-none h-32"
                            placeholder="What do you want to discuss?"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={!selectedSlot || createSession.isPending}
                        className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {createSession.isPending ? 'Booking...' : 'Confirm Booking'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default BookingPage;
