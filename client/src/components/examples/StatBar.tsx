import StatBar from '../StatBar';
import { Heart } from 'lucide-react';

export default function StatBarExample() {
  return (
    <div className="max-w-md space-y-4">
      <StatBar icon={Heart} label="Happiness" value={75} maxValue={100} color="text-pink-500" />
    </div>
  );
}
