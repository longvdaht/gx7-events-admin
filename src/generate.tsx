import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { Event, generatePresentationLink } from "./shared";
import { QRCode } from "react-qrcode-logo";

interface GeneratePresentationInputs {
  pdfFile: any;
  presentationName: string;
  slideNumberBatteryCheck: number | null;
  slideNumberSurvey: number;
  presentationDate: Date | null;
}

export default function Generate({ downloadImage }: any) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<GeneratePresentationInputs>();

  const [presentationLink, setPresentationLink] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalText, setModalText] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [eventName, setEventName] = useState(-1);

  const onCloseModal = (shouldReset: boolean) => {
    setLoading(false);
    setSuccess(false);
    setModalText("");
    setShowModal(false);
    if (shouldReset) {
      reset({
        pdfFile: null,
        presentationName: "",
        presentationDate: null,
        slideNumberBatteryCheck: null,
        slideNumberSurvey: 0,
      });
    }
  };

  const uploadFile = async (file: any, presentationFileName: string) => {
    try {
      const { data } = await axios.get("/api/upload", {
        params: { key: presentationFileName, contentType: file.type || "application/pdf" },
      });

      await axios.put(data.url, file, {
        headers: {
          "Content-Type": file.type || "application/pdf",
          "x-amz-acl": "public-read",
        },
      });

      setLoading(false);
      setSuccess(true);
    } catch (err: any) {
      setLoading(false);
      alert(err.response?.data?.error ?? err.message ?? JSON.stringify(err));
    }
  };

  const createEvent = (eventData: Event, file: any, fileName: string) => {
    setLoading(true);
    axios
      .post(process.env.NEXT_PUBLIC_EVENTS_BACKEND_URL + "events", {
        ...eventData,
      })
      .then((response) => {
        if (response.data.id) {
          const presentationLink = generatePresentationLink(response.data.name);
          setPresentationLink(presentationLink);
          uploadFile(file, fileName);
          setEventName(response.data.name);
        }
      })
      .catch((error) => {
        const errorMessage = error.response.data.message;
        if (errorMessage.includes("Unique constraint")) {
          setModalText("An event with that name already exists");
        } else {
          setModalText(errorMessage);
        }
        setLoading(false);
      });
  };

  const openPresentation = () => {
    var win = window.open(presentationLink, "_blank");
    win?.focus();
  };

  const onSubmit = ({
    pdfFile,
    presentationName,
    slideNumberBatteryCheck,
    slideNumberSurvey,
    presentationDate,
  }: GeneratePresentationInputs) => {
    const dt = new Date(presentationDate ?? new Date());
    const date =
      dt.getFullYear().toString() +
      (dt.getMonth() + 1).toString() +
      dt.getDate().toString();
    const presentationFileName = `${date}${presentationName}`;
    const linkPresentationFileName = presentationFileName.replace(/\s/g, "_");
    const presentationFileLink = `https://${process.env.NEXT_PUBLIC_AWS_S3_BUCKET}.s3.amazonaws.com/${linkPresentationFileName}`;
    const surveySlideNumberValue =
      slideNumberSurvey.toString() == "" ? 0 : slideNumberSurvey;
    const eventData: Event = {
      name: presentationName,
      batteryCheckSlideNumber: parseInt(
        slideNumberBatteryCheck?.toString() ?? "0"
      ),
      countdownTimer: 120,
      surveySlideNumber: parseInt(surveySlideNumberValue.toString()),
      pdfUrl: presentationFileLink,
      date: dt.toString(),
      isActive: true,
      moreInfo: "",
      sessionDuration: 0,
    };
    setShowModal(true);
    createEvent(eventData, pdfFile[0], linkPresentationFileName);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="card w-96 bg-primary-content shadow-xl">
        <div className="card-body color-primary">
          <h2 className="card-title">Generate a new presentation!</h2>
          <label className="label">
            <span className="label-text">Presentation pdf file</span>
          </label>
          <input
            type="file"
            className="file-input file-input-primary"
            {...register("pdfFile", { required: true })}
          />
          <>
            {errors.pdfFile && (
              <label className="label-text text-error">
                Pdf file is required
              </label>
            )}
          </>
          <label className="label">
            <span className="label-text">
              Presentation short name e.g. AIME
            </span>
          </label>
          <input
            type="text"
            placeholder="Presentation Name"
            className="input input-bordered input-primary"
            {...register("presentationName", {
              required: true,
              pattern: { value: /^[a-zA-Z0-9]+$/g, message: "Invalid name" },
            })}
          />
          <>
            {errors.presentationName && (
              <label className="label-text text-error">
                Presentation name is invalid
              </label>
            )}
          </>
          <label className="label">
            <span className="label-text">Presentation date</span>
          </label>
          <input
            type="date"
            placeholder="Presentation Date"
            className="input input-bordered input-primary"
            {...register("presentationDate", { required: true })}
          />
          <>
            {errors.presentationDate && (
              <label className="label-text text-error">
                Presentation date is required
              </label>
            )}
          </>
          <label className="label">
            <span className="label-text">
              Slide number for Battery Check (empty slide)
            </span>
          </label>
          <input
            type="number"
            min="1"
            placeholder="Slide number for Battery Check"
            className="input input-bordered input-primary"
            {...register("slideNumberBatteryCheck", { required: true, min: 1 })}
          />
          <>
            {errors.slideNumberBatteryCheck && (
              <label className="label-text text-error">
                Page number for Battery Check is required
              </label>
            )}
          </>
          <label className="label">
            <span className="label-text">
              Slide number for survey timer (0 or empty if n/a)
            </span>
          </label>
          <input
            type="number"
            min={0}
            placeholder="Slide number for survey"
            className="input input-bordered input-primary"
            {...register("slideNumberSurvey", { required: false, min: 0 })}
          />
          <>
            {errors.slideNumberSurvey && (
              <label className="label-text text-error">
                Invalid survey slide number
              </label>
            )}
          </>
          <div className="card-actions justify-end mt-4">
            <button
              className="btn btn-primary"
              onClick={handleSubmit(onSubmit)}
              disabled={isSubmitting}
            >
              Generate
            </button>
          </div>
        </div>
      </div>

      <input
        type="checkbox"
        id="my-modal"
        className="modal-toggle"
        checked={showModal}
        readOnly
      />
      <div className="modal">
        <div className="modal-box">
          {loading && (
            <>
              <h3 className="font-bold text-lg">Generating presentation...</h3>
              <div className="flex w-full align-middle justify-center">
                <progress className="progress w-56 align-middle my-4"></progress>
              </div>
            </>
          )}
          {success && (
            <>
              <h1 className="font-bold text-lg">
                Presentation generated correctly!
              </h1>
              <div
                ref={downloadImage.printRef}
                className="w-full flex flex-col items-center mt-4"
              >
                <QRCode
                  value={
                    process.env.NEXT_PUBLIC_BATTERY_CHECK_URL +
                    `?event=${eventName}`
                  }
                  size={300}
                  fgColor="#005943"
                  bgColor="#FFFFFF"
                  eyeRadius={15}
                />
              </div>
              <div className="flex w-full">
                <label
                  onClick={downloadImage.handleDownloadImage}
                  className="btn btn-primary mx-auto my-4"
                >
                  Download QR
                </label>
              </div>
            </>
          )}
          {modalText != "" && <label>{modalText}</label>}

          {!loading && (
            <div className="flex flex-row justify-evenly">
              <div className="modal-action">
                <label
                  onClick={() =>
                    success ? onCloseModal(true) : onCloseModal(false)
                  }
                  htmlFor="my-modal"
                  className="btn btn-primary"
                >
                  Close
                </label>
              </div>
              {success && (
                <div className="modal-action">
                  <label
                    onClick={() => openPresentation()}
                    htmlFor="my-modal"
                    className="btn btn-primary"
                  >
                    View Presentation
                  </label>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
