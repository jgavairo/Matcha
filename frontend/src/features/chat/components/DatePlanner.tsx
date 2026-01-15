import React, { useState, useEffect } from 'react';
import { DateProposal, dateService } from '../services/dateService';
import { useAuth } from '@context/AuthContext';
import { useSocket } from '@context/SocketContext';
import { useNotification } from '@context/NotificationContext';
import { HiCalendar, HiCheck, HiX, HiPencil, HiTrash, HiLocationMarker, HiClock } from 'react-icons/hi';
import { Button, Label, TextInput, Textarea, Datepicker } from 'flowbite-react';

interface DatePlannerProps {
    targetUserId: number;
    targetUsername: string;
    isOpen?: boolean;
    onToggle: (isOpen: boolean) => void;
}

const DatePlanner: React.FC<DatePlannerProps> = ({ targetUserId, targetUsername, isOpen: controlledIsOpen, onToggle }) => {
    const { user } = useAuth();
    const { socketService } = useSocket();
    const { addToast } = useNotification();
    const [date, setDate] = useState<DateProposal | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        date: '',
        time: '',
        location: '',
        description: ''
    });

    useEffect(() => {
        loadDate();
    }, [targetUserId]);

    useEffect(() => {
        const handleUpdate = (updatedDate: DateProposal) => {
            // Since we assume only one active date, we can just reload or check id
            // But simplify: reload
            loadDate();
            // Force open if new date comes and we are looking
            if (!date && updatedDate && updatedDate.sender_id !== user?.id) {
                 // optionally open or notify
                 // For now, let's not force open to avoid intrusive behavior
            }
        };

        socketService.on('date_updated', handleUpdate);
        return () => {
            socketService.off('date_updated', handleUpdate);
        };
    }, [socketService, date, user]);

    const loadDate = async () => {
        try {
            const dates = await dateService.getDates(targetUserId);
            // Assuming simplified backend returns array of active dates, or we pick first
            // Backend logic was: return activeDate ? [activeDate] : []
            if (dates.length > 0) {
                setDate(dates[0]);
            } else {
                setDate(null);
            }
        } catch (error) {
            // Error already handled by UI
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // Combine date and time into datetime string
            const dateTime = formData.date && formData.time 
                ? `${formData.date}T${formData.time}:00`
                : formData.date || '';
            
            const submitData = {
                dateTime,
                location: formData.location,
                description: formData.description
            };

            if (date) {
                // Modify existing
                await dateService.modifyDate(date.id, submitData);
                addToast('Date updated successfully', 'success');
            } else {
                // Create new
                await dateService.proposeDate({
                    receiverId: targetUserId,
                    ...submitData
                });
                addToast('Date proposal sent', 'success');
            }
            setIsEditing(false);
            loadDate();
        } catch (error) {
            addToast('Failed to save date', 'error');
        }
    };

    const handleAction = async (action: 'accepted' | 'declined' | 'cancel') => {
        if (!date) return;
        try {
            if (action === 'cancel') {
                await dateService.cancelDate(date.id);
                setDate(null);
                addToast('Date cancelled', 'info');
            } else {
                await dateService.updateStatus(date.id, action);
                loadDate();
                addToast(`Date ${action}`, 'success');
            }
        } catch (error) {
            addToast(`Failed to ${action} date`, 'error');
        }
    };

    const startEdit = () => {
        if (date) {
            const d = new Date(date.date_time);
            const dateStr = d.toISOString().split('T')[0];
            const timeStr = d.toTimeString().slice(0, 5);
            setFormData({
                date: dateStr,
                time: timeStr,
                location: date.location,
                description: date.description
            });
        } else {
             setFormData({ date: '', time: '', location: '', description: '' });
        }
        setIsEditing(true);
    };

    // Render Logic
    const isVisible = controlledIsOpen; 
    
    if (!isVisible) return null;

    return (
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm transition-all p-4 z-20">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
                    <HiCalendar className="text-purple-500" />
                    Date with {targetUsername}
                </h3>
            </div>

            {/* Content */}
            {!date && !isEditing && (
                <div className="text-center py-4">
                    <p className="text-gray-500 mb-3">No date planned yet.</p>
                    <Button size="sm" color="purple" onClick={startEdit} className="w-full">
                        Propose a Date
                    </Button>
                </div>
            )}

            {isEditing && (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <div className="mb-1 block"><Label htmlFor="dp-date">When?</Label></div>
                        <div className="flex gap-2">
                            <div className="flex-1">
                                <Datepicker
                                    id="dp-date"
                                    className="w-full"
                                    minDate={new Date()}
                                    value={formData.date ? new Date(formData.date) : undefined}
                                    onChange={(selectedDate: Date | null) => {
                                        if (selectedDate) {
                                            const dateStr = selectedDate.toISOString().split('T')[0];
                                            setFormData({...formData, date: dateStr});
                                        } else {
                                            setFormData({...formData, date: ''});
                                        }
                                    }}
                                    required
                                />
                            </div>
                            <div className="w-32">
                                <TextInput 
                                    id="dp-time" 
                                    type="time" 
                                    required 
                                    value={formData.time} 
                                    onChange={e => setFormData({...formData, time: e.target.value})} 
                                />
                            </div>
                        </div>
                    </div>
                    <div>
                        <div className="mb-1 block"><Label htmlFor="dp-location">Where?</Label></div>
                        <TextInput id="dp-location" placeholder="Location..." required value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
                    </div>
                    <div>
                         <div className="mb-1 block"><Label htmlFor="dp-desc">What?</Label></div>
                        <Textarea id="dp-desc" placeholder="Let's grab coffee..." rows={2} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                    </div>
                    <div className="flex justify-end gap-2">
                         <Button size="sm" color="gray" onClick={() => setIsEditing(false)}>Cancel</Button>
                         <Button size="sm" type="submit" color="purple">{date ? "Update" : "Send"}</Button>
                    </div>
                </form>
            )}

            {date && !isEditing && (
                <div className="space-y-3">
                    {/* Status Banner */}
                    <div className={`text-xs font-bold px-2 py-1 rounded w-fit ${
                        date.status === 'accepted' ? 'bg-green-100 text-green-600' :
                        date.status === 'declined' ? 'bg-red-100 text-red-600' : 
                        'bg-yellow-100 text-yellow-600'
                    }`}>
                        {date.status.toUpperCase()} 
                        {date.status === 'pending' && date.sender_id === user?.id && " (Waiting response)"}
                    </div>

                    {/* Details */}
                    <div>
                        <p className="font-medium text-lg text-gray-800 dark:text-gray-200 flex items-center gap-2">
                             <HiClock className="text-gray-400" /> 
                             {new Date(date.date_time).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                        </p>
                        <p className="font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                             <HiLocationMarker className="text-gray-400" />
                             {date.location}
                        </p>
                        {date.description && <p className="text-sm text-gray-500 mt-1 italic">"{date.description}"</p>}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 justify-end pt-2 border-t dark:border-gray-700">
                        {date.status === 'pending' && date.sender_id !== user?.id && (
                            <>
                                <Button size="xs" className="!bg-gradient-to-r !from-green-400 !to-teal-500 !text-white !border-none hover:opacity-90" onClick={() => handleAction('accepted')}>
                                    <HiCheck className="mr-1 h-3 w-3" /> Accept
                                </Button>
                                <Button size="xs" className="!bg-gradient-to-r !from-pink-500 !to-orange-400 !text-white !border-none hover:opacity-90" onClick={() => handleAction('declined')}>
                                    <HiX className="mr-1 h-3 w-3" /> Decline
                                </Button>
                            </>
                        )}
                        
                        {(date.status === 'accepted' || (date.status === 'pending' && date.sender_id === user?.id)) && (
                             <Button size="xs" color="light" onClick={startEdit}>
                                <HiPencil className="mr-1 h-3 w-3" /> Modify
                             </Button>
                        )}

                        <Button size="xs" color="gray" onClick={() => handleAction('cancel')}>
                            <HiTrash className="mr-1 h-3 w-3" /> Cancel
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DatePlanner;
