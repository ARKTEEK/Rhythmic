import { ReactNode } from "react";

export interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  bgColor?: string;
  iconBg?: string;
  iconColor?: string;
}

export function FeatureCard({
                              icon,
                              title,
                              description,
                              bgColor = "bg-gray-50",
                              iconBg = "bg-gray-100",
                              iconColor = "text-gray-600"
                            }: FeatureCardProps) {
  return (
    <div
      className={ `flex items-start gap-4 p-4 box-style-md ${ bgColor }` }>
      <div className={ `p-3 flex-shrink-0 box-style-md ${ iconBg }` }>
        <div className={ `text-2xl ${ iconColor }` }>{ icon }</div>
      </div>
      <div>
        <h3 className="text-xl font-black text-gray-900 mb-1">{ title }</h3>
        <p className="text-gray-700 font-medium">{ description }</p>
      </div>
    </div>
  );
}
