import React from "react";

export interface AlertProps {
  children: React.ReactNode;
  dismiss?: () => void;
}

export function Alert({ children, dismiss }: AlertProps) {

    return <div className="alert">
      <span>{children}</span>

      {dismiss && <button onClick={dismiss} title="dismiss alert">X</button>}
    </div>;
}

