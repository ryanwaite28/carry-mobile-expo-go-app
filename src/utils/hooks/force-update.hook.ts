import { useState } from "react";



// https://stackoverflow.com/questions/46240647/react-how-to-force-a-function-component-to-render
export function useForceUpdate(screen?: string) {
  const id = `forceUpdate-${Date.now()}`;
  console.log(`force update hook created:`, { id, screen });

  const [value, setValue] = useState(0); // integer state
  return () => {
    const oldVal = value;
    const newVal = oldVal + 1;
    console.log(`force update called:`, { id, oldVal, newVal });
    setValue(newVal);
  }; // update state to force render
  // An function that increment 👆🏻 the previous state like here 
  // is better than directly setting `value + 1`
}