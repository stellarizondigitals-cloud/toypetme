import StatsPanel from '../StatsPanel';

export default function StatsPanelExample() {
  return (
    <div className="max-w-md">
      <StatsPanel hunger={85} happiness={70} energy={60} cleanliness={90} />
    </div>
  );
}
