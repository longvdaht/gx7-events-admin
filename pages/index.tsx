import { useRef, useState } from "react";
import Image from "next/image";
import Generate from "../src/generate";
import View from "../src/view";
import html2canvas from "html2canvas";
import { logoutHandler } from "next-password-protect";
import { useRouter } from "next/router";

export default function Home() {
  const [showCreate, setShowGenerate] = useState(true);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertText, setAlertText] = useState("");
  const printRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const handleDownloadImage = async () => {
    const element = printRef.current;
    const canvas = await html2canvas(element!);

    const data = canvas.toDataURL("image/jpg");
    const link = document.createElement("a");

    if (typeof link.download === "string") {
      link.href = data;
      link.download = "image.jpg";

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      window.open(data);
    }
  };

  const alertModal = (title: string, text: string) => {
    setAlertTitle(title);
    setAlertText(text);
    setShowAlertModal(true);
  };

  const closeAlertModal = () => {
    setShowAlertModal(false);
    setAlertText("");
    setAlertTitle("");
  };

  const logout = async () => {
    await fetch('/api/logout', {
      method: 'post',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });
    window.location.reload();
  }

  return (
    <main>
      <div className="navbar bg-base-100">
        <div className="navbar-start">
          <div className="dropdown">
            <label tabIndex={0} className="btn btn-ghost btn-circle">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h7"
                />
              </svg>
            </label>
            <ul
              tabIndex={0}
              className="menu menu-compact dropdown-content mt-3 p-2 shadow bg-base-100 rounded-box w-52"
            >
              <li>
                <a onClick={() => setShowGenerate(true)}>Generate</a>
              </li>
              <li>
                <a onClick={() => setShowGenerate(false)}>History</a>
              </li>
              <li>
                <a onClick={() => logout()}>Logout</a>
              </li>
            </ul>
          </div>
        </div>
        <div className="navbar-center">
          <a className="btn btn-ghost normal-case">
            <Image src="/main_green.svg" alt="logo" width={200} height={0} />
          </a>
        </div>
        <div className="navbar-end"></div>
      </div>
      {showCreate && (
        <Generate downloadImage={{ printRef, handleDownloadImage }} />
      )}
      {!showCreate && (
        <View
          alertModal={alertModal}
          downloadImage={{ printRef, handleDownloadImage }}
        />
      )}
      {showAlertModal && (
        <>
          <input
            type="checkbox"
            id="alert-modal"
            className="modal-toggle"
            checked={showAlertModal}
            readOnly
          />
          <div className="modal">
            <div className="modal-box">
              <h3 className="font-bold text-lg">{alertTitle}</h3>

              <label>{alertText}</label>

              <div className="flex flex-row justify-evenly">
                <div className="modal-action">
                  <label
                    onClick={() => closeAlertModal()}
                    htmlFor="alert-modal"
                    className="btn btn-primary"
                  >
                    Ok
                  </label>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </main>
  );
}
