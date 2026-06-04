interface ErrorDisplayProps {
  error: Error;
}

export function ErrorDisplay({ error }: ErrorDisplayProps): JSX.Element {
  return (
    <div className="flex items-center justify-center h-full text-red-500">
      {error.message}
    </div>
  );
}
