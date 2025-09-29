import LoadingWindow from "../../components/ui/Window/LoadingWindow.tsx";

export default function PlaceholderPage() {
  return (
    <LoadingWindow
      status={ "error" }
      loadingMessage={ `Linking your account...` }
      errorMessage="Authentication failed! Please try again...."
      completeMessage="Authentication successful."
    />
  );
}
