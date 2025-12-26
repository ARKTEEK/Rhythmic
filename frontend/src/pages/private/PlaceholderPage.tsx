import LoadingWindow from "../../components/ui/Window/LoadingWindow.tsx";

export default function PlaceholderPage() {
  return (
    <LoadingWindow
      loadingSpeed={ 2000 }
      status={ "loading" }
      loadingMessage={ "Loading connections..." }
    />
  );
}
