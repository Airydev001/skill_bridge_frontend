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
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toLocaleDateString('en-CA'));

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
            // Use replace to prevent going back to the booking form easily
            navigate('/dashboard', { replace: true });
        },
        onError: (error: any) => {
            console.error('Booking failed:', error);
            alert('Failed to book session. Please try again.');
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

    // Clear selected slot when date changes
    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedDate(e.target.value);
        setSelectedSlot(null);
    };

    if (!mentor) return <div>Loading...</div>;

    // Get today's date in local format YYYY-MM-DD
    const today = new Date().toLocaleDateString('en-CA');

    return (
        <div className="min-h-screen bg-neutral-softGray p-4 md:p-8 flex justify-center">
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl w-full max-w-2xl h-fit">
                <h2 className="text-2xl md:text-3xl font-heading font-bold mb-6">Book a Session with {mentor.userId.name}</h2>

                <div className="mb-8">
                    <h3 className="text-xl font-bold mb-4">Select a Date & Time</h3>

                    <input
                        type="date"
                        value={selectedDate}
                        onChange={handleDateChange}
                        className="mb-6 p-2 border border-gray-300 rounded-lg w-full"
                        min={today}
                    />

                    {isLoadingSlots ? (
                        <div className="flex justify-center p-4">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    ) : availableSlots && availableSlots.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {availableSlots.map((slot) => (
                                <button
                                    key={slot}
                                    onClick={() => setSelectedSlot(slot)}
                                    className={`p-3 rounded-lg border transition-all text-sm md:text-base ${selectedSlot === slot ? 'bg-primary text-white border-primary shadow-md' : 'border-gray-300 hover:border-primary hover:bg-blue-50'}`}
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
                            className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary outline-none h-32 resize-none"
                            placeholder="What do you want to discuss?"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={!selectedSlot || createSession.isPending}
                        className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
                    >
                        {createSession.isPending ? (
                            <>
                                <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></span>
                                Booking...
                            </>
                        ) : 'Confirm Booking'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default BookingPage;
