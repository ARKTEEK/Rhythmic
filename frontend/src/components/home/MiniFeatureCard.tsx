import { ReactNode } from "react";

export interface MiniFeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  bgColor?: string;
  iconBg?: string;
  iconColor?: string;
}

export function MiniFeatureCard({
                                  icon,
                                  title,
                                  description,
                                  bgColor = "bg-gray-50",
                                  iconBg = "bg-gray-100",
                                  iconColor = "text-gray-600"
                                }: MiniFeatureCardProps) {
  return (
    <div className={ `flex items-start gap-3 p-3 box-style-md ${ bgColor }` }>
      <div className={ `p-2 flex-shrink-0 box-style-md ${ iconBg }` }>
        <div className={ `text-lg ${ iconColor }` }>{ icon }</div>
      </div>
      <div>
        <h3 className="text-md font-black text-gray-900">{ title }</h3>
        <p className="text-gray-700 font-medium text-sm">{ description }</p>
      </div>
    </div>
  );
}
