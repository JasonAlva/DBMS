import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { CircleAlert } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div className="flex items-center justify-center min-h-screen px-4 py-12 bg-gray-50">
      <div className="w-full max-w-xl space-y-8 text-center">
        <div className="flex justify-center">
          <CircleAlert className="h-16 w-16 text-red-500" />
        </div>

        <div className="space-y-3">
          <h1 className="text-4xl font-bold tracking-tight">
            Oops! Access Denied
          </h1>

          <p className="text-gray-600 text-lg">
            You’ve reached a restricted area. Your role doesn’t have permission
            to access this page.
          </p>
        </div>

        <Link to="/" className="flex justify-center">
          <Button className="px-8" size="lg">
            Return to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
