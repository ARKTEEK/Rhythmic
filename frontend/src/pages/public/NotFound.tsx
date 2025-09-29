import ErrorWindow from "../../components/ui/Window/ErrorWindow.tsx";

export default function NotFound() {
  return (
    <ErrorWindow errorDescription={"Requested page not found!"}/>
  );
};
