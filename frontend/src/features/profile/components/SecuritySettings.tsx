import React from 'react';
import { ToggleSwitch, Card } from 'flowbite-react';
import { api } from '@services/api';
import { useNotification } from '@context/NotificationContext';

interface SecuritySettingsProps {
    consent: boolean;
    onConsentChange: (newConsent: boolean) => void;
}

const SecuritySettings: React.FC<SecuritySettingsProps> = ({ consent, onConsentChange }) => {
    const { addToast } = useNotification();

    const handleToggle = async (checked: boolean) => {
        try {
            await api.put('/users/consent', { consent: checked });
            onConsentChange(checked);
            addToast(`Geolocation consent ${checked ? 'granted' : 'revoked'}`, 'success');
        } catch (error) {
            addToast('Failed to update consent', 'error');
        }
    };

    return (
        <Card className="mt-4">
            <div className="flex flex-col gap-4">
                <h4 className="text-lg font-bold dark:text-white">Privacy Settings</h4>
                <div className="flex items-center justify-between">
                    <div>
                        <h5 className="font-medium dark:text-white">Geolocation Consent</h5>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Allow the application to use your GPS location for better matching.
                            If disabled, you must provide your location manually.
                        </p>
                    </div>
                    <ToggleSwitch 
                        checked={consent} 
                        onChange={handleToggle} 
                        label=""
                    />
                </div>
            </div>
        </Card>
    );
};

export default SecuritySettings;
