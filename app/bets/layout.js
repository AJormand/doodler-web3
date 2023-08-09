import LeftBar from "../components/LeftBar";

export const metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({ children }) {
  return (
    <div className="flex w-full justify-center mt-10">
      <div className="flex max-w-[70%]">
        <LeftBar />
        <div className="mx-5">{children}</div>
      </div>
    </div>
  );
}
