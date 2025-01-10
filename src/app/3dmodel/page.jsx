// "use client"
// import dynamic from 'next/dynamic'

// // Import the 3D scene with no SSR
// const ThreeScene = dynamic(() => import('./ThreeScene'), {
//   ssr: false,
//   loading: () => (
//     <div className="w-full h-[500px] flex items-center justify-center">
//       Loading 3D Scene...
//     </div>
//   )
// })

export default function Page() {
  return <div className="w-full h-[500px]">{/* <ThreeScene /> */}</div>;
}
