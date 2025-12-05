import React, { useState } from 'react';
import { X, AlertTriangle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/client';

interface ReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    reportedUserId: string;
    reportedUserName: string;
}

const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose, reportedUserId, reportedUserName }) => {
    const [reason, setReason] = useState('');
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        try {
            await api.post('/reports', {
                reportedId: reportedUserId,
                reason,
                description
            });
            setSuccess(true);
            setTimeout(() => {
                onClose();
                setSuccess(false);
                setReason('');
                setDescription('');
            }, 2000);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to submit report');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-xl"
                >
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-red-50">
                        <h3 className="text-xl font-bold text-red-700 flex items-center gap-2">
                            <AlertTriangle className="w-6 h-6" />
                            Report User
                        </h3>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="p-6">
                        {success ? (
                            <div className="text-center py-8">
                                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <h4 className="text-xl font-bold text-gray-900 mb-2">Report Submitted</h4>
                                <p className="text-gray-600">Thank you for keeping our community safe. We will review this shortly.</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <p className="text-sm text-gray-600 mb-4">
                                    You are reporting <span className="font-bold">{reportedUserName}</span>. Please provide details below.
                                </p>

                                {error && (
                                    <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                                        {error}
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                                    <select
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                        required
                                        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                                    >
                                        <option value="">Select a reason</option>
                                        <option value="harassment">Harassment or Bullying</option>
                                        <option value="inappropriate_content">Inappropriate Content</option>
                                        <option value="spam">Spam or Scam</option>
                                        <option value="hate_speech">Hate Speech</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        required
                                        rows={4}
                                        placeholder="Please describe what happened..."
                                        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none resize-none"
                                    />
                                </div>

                                <div className="flex justify-end gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="px-6 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                        Submit Report
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default ReportModal;
