import { Button } from "@/components/ui/button";
import { UserCircleIcon } from "lucide-react";

export const AuthButton = () => {
  return (
    <Button
      variant="outline"
      className=" text-blue-600 hover:text-blue-500 shadow-none px-5 py-5 rounded-full  "
    >
      <UserCircleIcon />
      Sign in
    </Button>
  );
};
