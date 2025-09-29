import React from "react";
import Ribbon from "./Ribbon";

interface WindowProps {
  containerClassName?: string;
  ribbonClassName?: string;
  windowClassName?: string;
  children: React.ReactNode;
}

export default function Window({
                                 containerClassName = "h-[300px] w-[400px]",
                                 ribbonClassName,
                                 windowClassName,
                                 children,
                               }: WindowProps) {
  return (
    <div
      className={ `box-style-lg transform transition-transform 
                   duration-300 flex flex-col ${ containerClassName }` }
      style={ { backgroundColor: windowClassName ? "" : "#fefefe" } }>
      <Ribbon className={ ribbonClassName }/>
      <div
        className={ `
          p-4 rounded-b-lg flex flex-col flex-grow
          ${ windowClassName || "bg-brown-100" }` }
        style={ {
          flexGrow: 1,
          overflowY: "auto",
        } }>
        { children }
      </div>
    </div>
  );
}
