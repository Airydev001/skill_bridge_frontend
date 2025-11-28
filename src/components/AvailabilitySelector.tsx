import { useState, useEffect } from 'react';
import { Plus, X, Clock } from 'lucide-react';

interface AvailabilitySlot {
    day: string;
    slots: string[];
    timezone: string;
}

interface AvailabilitySelectorProps {
    onChange: (availability: AvailabilitySlot[]) => void;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const AvailabilitySelector = ({ onChange }: AvailabilitySelectorProps) => {
    const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);

    useEffect(() => {
        onChange(availability);
    }, [availability, onChange]);

    const toggleDay = (day: string) => {
        if (availability.find(a => a.day === day)) {
            setAvailability(availability.filter(a => a.day !== day));
        } else {
            setAvailability([...availability, { day, slots: ['09:00'], timezone: Intl.DateTimeFormat().resolvedOptions().timeZone }]);
        }
    };

    const addSlot = (day: string) => {
        setAvailability(availability.map(a => {
            if (a.day === day) {
                return { ...a, slots: [...a.slots, '09:00'] };
            }
            return a;
        }));
    };

    const removeSlot = (day: string, index: number) => {
        setAvailability(availability.map(a => {
            if (a.day === day) {
                const newSlots = [...a.slots];
                newSlots.splice(index, 1);
                return { ...a, slots: newSlots };
            }
            return a;
        }));
    };

    const updateSlot = (day: string, index: number, value: string) => {
        setAvailability(availability.map(a => {
            if (a.day === day) {
                const newSlots = [...a.slots];
                newSlots[index] = value;
                return { ...a, slots: newSlots };
            }
            return a;
        }));
    };

    return (
        <div className="space-y-4">
            <h3 className="font-bold text-neutral-charcoal">Availability</h3>
            <p className="text-sm text-gray-500 mb-4">Select the days and times you are available for sessions.</p>

            <div className="space-y-3">
                {DAYS.map(day => {
                    const dayAvailability = availability.find(a => a.day === day);
                    const isSelected = !!dayAvailability;

                    return (
                        <div key={day} className={`border rounded-xl p-4 transition-all ${isSelected ? 'border-primary bg-blue-50/30' : 'border-gray-200'}`}>
                            <div className="flex items-center justify-between mb-2">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={() => toggleDay(day)}
                                        className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                                    />
                                    <span className={`font-medium ${isSelected ? 'text-primary' : 'text-gray-700'}`}>{day}</span>
                                </label>
                                {isSelected && (
                                    <button
                                        type="button"
                                        onClick={() => addSlot(day)}
                                        className="text-sm text-primary font-medium hover:text-primary/80 flex items-center gap-1"
                                    >
                                        <Plus className="w-4 h-4" /> Add Slot
                                    </button>
                                )}
                            </div>

                            {isSelected && dayAvailability && (
                                <div className="pl-8 grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
                                    {dayAvailability.slots.map((slot, index) => (
                                        <div key={index} className="flex items-center gap-2">
                                            <div className="relative flex-1">
                                                <Clock className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <input
                                                    type="time"
                                                    value={slot}
                                                    onChange={(e) => updateSlot(day, index, e.target.value)}
                                                    className="w-full pl-8 p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                                                />
                                            </div>
                                            {dayAvailability.slots.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeSlot(day, index)}
                                                    className="text-red-400 hover:text-red-600 p-1"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default AvailabilitySelector;
