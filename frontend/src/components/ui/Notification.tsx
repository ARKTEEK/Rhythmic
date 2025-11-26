import { ToastContentProps } from "react-toastify";

type NotificationProps = ToastContentProps<{
  title: string;
  content: string;
}>;

export default function Notification({
                                       closeToast,
                                       data,
                                       toastProps,
                                     }: NotificationProps) {
  const styles = {
    success: "bg-[#5cb973] text-black",
    error: "bg-[#f26b6b] text-white",
    info: "bg-[#f3d99c] text-black",
    warning: "bg-[#f3d99c] text-black",
    default: "bg-[#f3d99c] text-black",
  };

  const type = toastProps.type || "default";
  const headerColorClass = styles[type] || styles.default;

  return (
    <div className="flex flex-col w-full font-mono bg-[#fff9ec] box-style-lg overflow-hidden">

      <div
        className={ `w-full px-3 py-2 border-b-2 border-black font-extrabold uppercase 
                        tracking-wider text-sm ${ headerColorClass }` }>
        { data.title }
      </div>

      <div className="flex items-center justify-between p-4">
        <p className="text-sm text-black font-medium leading-tight">
          { data.content }
        </p>

        <button
          onClick={ closeToast }
          className="ml-4 text-xs font-bold underline hover:no-underline uppercase
                     shrink-0 hover:cursor-pointer">
          { type === 'error' ? 'Retry' : 'Close' }
        </button>
      </div>
    </div>
  );
}