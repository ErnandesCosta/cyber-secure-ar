interface LoadingSpinnerProps {
  message?: string;
}

export const LoadingSpinner = ({ message = "Carregando..." }: LoadingSpinnerProps) => {
  return (
    <div className="loading-box">
      <div className="spinner" />
      <p>{message}</p>
    </div>
  );
};