"use client";
import store from "@/redux/store";
import { Provider } from "react-redux";
// -- props -- //
type Props = Readonly<{
  children: React.ReactNode;
}>;
const ReduxStoreProvider = ({ children }: Props) => {
  return <Provider store={store}>{children}</Provider>;
};

export default ReduxStoreProvider;
