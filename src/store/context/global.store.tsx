import React, { createContext, useState } from 'react';
import { IUser } from '../../interfaces/user.interface';



export const AppGlobalsContext = createContext({
  GOOGLE_API_KEY: '',
  STRIPE_PUBLIC_KEY: '',
  YOU: null as IUser | null,

  SET_GOOGLE_API_KEY: (key: string) => {},
  SET_STRIPE_PUBLIC_KEY: (key: string) => {},
  SET_YOU: (you: IUser | null) => {},
});



export function AppGlobalsContextProvider (props) {
  const [GOOGLE_API_KEY, SET_GOOGLE_API_KEY] = useState('');
  const [STRIPE_PUBLIC_KEY, SET_STRIPE_PUBLIC_KEY] = useState('');
  const [YOU, SET_YOU] = useState<IUser | null>(null);

  const value = {
    GOOGLE_API_KEY,
    STRIPE_PUBLIC_KEY,
    YOU,

    SET_GOOGLE_API_KEY: (key: string) => {
      SET_GOOGLE_API_KEY(key);
    },
    SET_STRIPE_PUBLIC_KEY: (key: string) => {
      SET_STRIPE_PUBLIC_KEY(key);
    },
    SET_YOU: (you: IUser | null) => {
      SET_YOU(you);
    },
  };

  return (
    <AppGlobalsContext.Provider value={value}>
      {props.children}
    </AppGlobalsContext.Provider>
  );
}