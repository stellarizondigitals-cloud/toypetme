import ActionButtons from '../ActionButtons';

export default function ActionButtonsExample() {
  return (
    <div className="max-w-md">
      <ActionButtons
        onFeed={() => console.log('Feed')}
        onPlay={() => console.log('Play')}
        onClean={() => console.log('Clean')}
        onSleep={() => console.log('Sleep')}
      />
    </div>
  );
}
