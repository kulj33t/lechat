import { Link, useNavigate } from "react-router-dom";
import Error from "../assets/Error.webp";

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="h-screen pt-16 flex flex-col items-center justify-center space-y-8 p-4 relative">
      <div
        className="absolute top-0 left-0 w-full h-full bg-cover bg-center"
        style={{
          backgroundImage: `url(${Error})`,
          opacity: 0.5,
          filter: "blur(2px)",
          objectFit: "contain",
        }}
      ></div>
      <div className="flex items-center flex-col gap-5 relative z-10  text-center">
        <h1 className="text-6xl font-bold text-black">404</h1>
        <p className="text-xl text-black">
          Oops! The page you are looking for does not exist.
        </p>
        <div className="space-x-4">
          <Link to="/" className="btn btn-primary">
            Home
          </Link>
          <button onClick={() => navigate(-1)} className="btn btn-secondary">
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
