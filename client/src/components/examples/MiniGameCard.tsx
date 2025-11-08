import MiniGameCard from '../MiniGameCard';
import gameImage from '@assets/generated_images/Pet_playing_animation_f6e51e40.png';

export default function MiniGameCardExample() {
  return (
    <div className="max-w-xs">
      <MiniGameCard
        id={1}
        name="Ball Catch"
        description="Catch falling balls"
        reward={50}
        isLocked={false}
        image={gameImage}
      />
    </div>
  );
}
