import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./App.css";
import { LevoNote } from "./components/levo-note-v2";
import { Toaster } from "./components/ui/toaster";

export function App() {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <LevoNote />
      <Toaster />
    </QueryClientProvider>
  );
}
export default App;

// todo: toast for errors, notifications for success