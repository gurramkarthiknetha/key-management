// 'use client';

// import React, { useState } from 'react';
// import { useRouter } from 'next/navigation';
// import { useAuth } from '@/lib/auth-context';
// import { Eye, EyeOff, LogIn, User, Lock } from 'lucide-react';
// import toast from 'react-hot-toast';

// export default function LoginForm() {
//   const [formData, setFormData] = useState({
//     email: '',
//     password: ''
//   });
//   const [showPassword, setShowPassword] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);

//   const { login } = useAuth();
//   const router = useRouter();

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }));
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
    
//     if (!formData.email || !formData.password) {
//       toast.error('Please fill in all fields');
//       return;
//     }

//     setIsLoading(true);

//     try {
//       const result = await login(formData);

//       if (result.success) {
//         toast.success('Login successful!');
//         router.push('/dashboard');
//       } else {
//         toast.error(result.error || 'Invalid credentials');
//       }
//     } catch (error) {
//       console.error('Login error:', error);
//       toast.error('Login failed. Please try again.');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit} className="space-y-6">
//       <div>
//         <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
//           Email Address
//         </label>
//         <div className="relative">
//           <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//             <User className="h-5 w-5 text-gray-400" />
//           </div>
//           <input
//             id="email"
//             name="email"
//             type="email"
//             required
//             value={formData.email}
//             onChange={handleChange}
//             className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
//             placeholder="Enter your email address"
//             disabled={isLoading}
//           />
//         </div>
//       </div>

//       <div>
//         <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
//           Password
//         </label>
//         <div className="relative">
//           <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//             <Lock className="h-5 w-5 text-gray-400" />
//           </div>
//           <input
//             id="password"
//             name="password"
//             type={showPassword ? 'text' : 'password'}
//             required
//             value={formData.password}
//             onChange={handleChange}
//             className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
//             placeholder="Enter your password"
//             disabled={isLoading}
//           />
//           <button
//             type="button"
//             className="absolute inset-y-0 right-0 pr-3 flex items-center"
//             onClick={() => setShowPassword(!showPassword)}
//             disabled={isLoading}
//           >
//             {showPassword ? (
//               <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
//             ) : (
//               <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
//             )}
//           </button>
//         </div>
//       </div>

//       <div>
//         <button
//           type="submit"
//           disabled={isLoading}
//           className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors"
//         >
//           {isLoading ? (
//             <>
//               <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
//               Signing in...
//             </>
//           ) : (
//             <>
//               <LogIn className="h-4 w-4 mr-2" />
//               Sign in
//             </>
//           )}
//         </button>
//       </div>

//       <div className="text-center space-y-3">
//         <p className="text-sm text-gray-600">
//           Don't have an account?{' '}
//           <a
//             href="/register"
//             className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
//           >
//             Register here
//           </a>
//         </p>
//         <p className="text-sm text-gray-600">
//           Need help? Contact your system administrator
//         </p>
//       </div>
//     </form>
//   );
// }
