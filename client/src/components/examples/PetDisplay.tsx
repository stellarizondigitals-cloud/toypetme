import PetDisplay from '../PetDisplay';

export default function PetDisplayExample() {
  return (
    <div className="max-w-2xl mx-auto">
      <PetDisplay name="Fluffy" level={5} mood="happy" />
    </div>
  );
}
