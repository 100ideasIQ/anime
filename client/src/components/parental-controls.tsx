import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { setParentalPin, verifyParentalPin } from '@/lib/firestore-utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, Unlock } from 'lucide-react';

export default function ParentalControls() {
  const { currentUser, userProfile, updateUserProfile } = useAuth();
  const [pin, setPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);

  const hasPin = userProfile?.parentalPin && userProfile.parentalPin.length > 0;

  const handleSetPin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
      return setError('PIN must be exactly 4 digits');
    }
    
    if (newPin !== confirmPin) {
      return setError('PINs do not match');
    }

    if (!currentUser) return;

    setLoading(true);
    setError('');
    
    try {
      await setParentalPin(currentUser.uid, newPin);
      await updateUserProfile({ parentalPin: newPin });
      setSuccess('Parental PIN set successfully!');
      setNewPin('');
      setConfirmPin('');
    } catch (err) {
      setError('Failed to set PIN');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) return;

    setLoading(true);
    setError('');
    
    try {
      const isValid = await verifyParentalPin(currentUser.uid, pin);
      if (isValid) {
        setIsUnlocked(true);
        setSuccess('PIN verified! Parental controls unlocked for this session.');
        setPin('');
      } else {
        setError('Incorrect PIN');
      }
    } catch (err) {
      setError('Failed to verify PIN');
    } finally {
      setLoading(false);
    }
  };

  const handleRemovePin = async () => {
    if (!currentUser) return;

    setLoading(true);
    setError('');
    
    try {
      await setParentalPin(currentUser.uid, '');
      await updateUserProfile({ parentalPin: '' });
      setSuccess('Parental PIN removed');
      setIsUnlocked(false);
    } catch (err) {
      setError('Failed to remove PIN');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isUnlocked ? <Unlock className="h-5 w-5" /> : <Lock className="h-5 w-5" />}
          Parental Controls
        </CardTitle>
        <CardDescription>
          Set a 4-digit PIN to restrict access to mature content
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-500/10 text-green-500 px-4 py-3 rounded-lg">
            {success}
          </div>
        )}

        {!hasPin ? (
          <form onSubmit={handleSetPin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Set 4-Digit PIN</label>
              <Input
                type="password"
                maxLength={4}
                placeholder="0000"
                value={newPin}
                onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Confirm PIN</label>
              <Input
                type="password"
                maxLength={4}
                placeholder="0000"
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                required
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? 'Setting...' : 'Set PIN'}
            </Button>
          </form>
        ) : isUnlocked ? (
          <div className="space-y-4">
            <p className="text-sm text-green-500">Parental controls are currently unlocked</p>
            <Button variant="destructive" onClick={handleRemovePin} disabled={loading}>
              Remove PIN
            </Button>
            <Button variant="outline" onClick={() => setIsUnlocked(false)}>
              Lock Again
            </Button>
          </div>
        ) : (
          <form onSubmit={handleVerifyPin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Enter PIN to Unlock</label>
              <Input
                type="password"
                maxLength={4}
                placeholder="0000"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                required
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? 'Verifying...' : 'Unlock'}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
