import { Logo } from "../../components/common/Logo.tsx";

const PlaceholderPage = () => {
  return (
    <div className="m-6">
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <div className="text-center text-white max-w-lg">
            <Logo size="lg" text="Linking your Account..." underline={false}/>
          <p className="text-black mb-6">Wait a few seconds...</p>
        </div>
      </div>
      );

    </div>
  );
};

export default PlaceholderPage;