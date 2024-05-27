import {useRef} from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";


export default function SignUp(){
    const username =  useRef();
    const email =  useRef();
    const conpassword =  useRef();
    const password =  useRef();
    const navigate = useNavigate();
    async function Submit(){
        try {
            if(conpassword.current.value !== password.current.value){
                console.log("not equal")
                return ;

            }
            const { data } = await axios.post(
                "http://localhost:4000/signup",
                {
                    email: email.current.value, 
                    password: password.current.value,
                     username: username.current.value, 
                     createdAt: new Date()
                },
                { withCredentials: true }
              );
              const { success, message } = data;
              if (success) {
                handleSuccess(message);
                setTimeout(() => {
                  navigate("/");
                }, 1000);
              } else {
                handleError(message);
              }
        } catch (error) {
            console.log(error);
        }
    }
    const handleError = (err) =>
        toast.error(err, {
          position: "bottom-left",
        });
      const handleSuccess = (msg) =>
        toast.success(msg, {
          position: "bottom-right",
        });
    return(
        <>
            <div className="mx-auto max-w-sm space-y-6">
            <div className="space-y-2 text-center">
                <h1 className="text-3xl font-bold">Sign Up</h1>
                <p className="text-gray-500 dark:text-gray-400">Enter your credentials to create an account.</p>
            </div>
            <div className="space-y-4">
                <div className="space-y-2">
                <label
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    for="username"
                >
                    Username
                </label>
                <input
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    id="username"
                    placeholder="Enter your username"
                    required=""
                    type="text"
                    ref={username}
                />
                </div>
                <div className="space-y-2">
                <label
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    for="email"
                >
                    Email
                </label>
                <input
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    id="email"
                    placeholder="Enter your username"
                    required=""
                    type="email"
                    ref={email}
                />
                </div>
                <div className="space-y-2">
                <label
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    for="password"
                >
                    Password
                </label>
                <input
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    id="password"
                    placeholder="Enter your password"
                    required=""
                    type="password"
                    ref={password}
                />
                </div>
                <div className="space-y-2">
                <label
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    for="con password"
                >
                    Confirm Password
                </label>
                <input
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    id="con password"
                    placeholder="Enter your password"
                    required=""
                    type="password"
                    ref={conpassword}
                />
                </div>
                <button
                onClick={(e)=>{e.preventDefault();Submit();}}
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full"
                type="submit"
                >
                Sign Up
                </button>
            </div>
            <ToastContainer/>
            </div>
        </>
    )
}