import axios from "axios";
import { useEffect, useState } from "react";
import { QRCode } from "react-qrcode-logo";
import { generatePresentationLink, ResponseEvent } from "./shared";

export default function View({ alertModal, downloadImage }: any) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [data, setData] = useState([]);
  const [eventId, setEventId] = useState(-1);
  const [eventName, setEventName] = useState("");


  const getEvents = () => {
    setLoading(true);
    axios.get(process.env.NEXT_PUBLIC_EVENTS_BACKEND_URL + 'events').then(
      response => {
        setData(response.data.reverse());
        setLoading(false);
        setSuccess(true);
      }
    ).catch(
      error => {
        setLoading(false);
        setSuccess(false);
        alert(error.response.data.message);
      }
    );
  }

  const resetEvent = () => {
    if (eventId) {
      axios.delete(process.env.NEXT_PUBLIC_EVENTS_BACKEND_URL + 'events/reset-results/' + eventId).then(
        response => {
          alertModal("Ok", "Event reset correctly");
          setData(response.data);
          getEvents();
          setShowModal(false);
        }
      ).catch(
        error => {
          alert(error.response.data.message);
        }
      );
    } else {
      alert("Invalid event id");
    }
  }

  const formatDate = (date: string) => {
    const dt = new Date(date);
    return dt.getDate().toString() + "/" + (dt.getMonth() + 1).toString() + "/" + dt.getFullYear().toString();
  }

  const deleteEvent = () => {
    if (eventId) {
      axios.delete(process.env.NEXT_PUBLIC_EVENTS_BACKEND_URL + 'events/' + eventId).then(
        () => {
          getEvents();
          setShowDeleteModal(false);
        }
      ).catch(
        error => {
          alert(error.response.data.message);
        }
      );
    } else {
      alert("Invalid event id");
    }
  }

  const openConfirmationModal = (event: ResponseEvent) => {
    if (event.id) {
      setEventId(event.id);
      setEventName(event.name);
      setShowModal(true);
    } else {
      alert("Invalid event id");
    }
  }

  const openQrModal = (event: ResponseEvent) => {
    if (event.id) {
      setEventId(event.id);
      setEventName(event.name);
      setShowQrModal(true);
    } else {
      alert("Invalid event id");
    }
  }

  useEffect(() => {
    getEvents();
  }, [])


  return (
    <div className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="card w-3/4 bg-primary-content shadow-xl">
        <div className="card-body color-primary">
          <h2 className="card-title">Events history</h2>
          {loading &&
            <>
              <h3 className="font-bold text-lg">Loading presentations...</h3>
              <div className="flex w-full align-middle justify-center">
                <progress className="progress w-56 align-middle my-4"></progress>
              </div>
            </>
          }
          {!loading && success &&
            <div className="overflow-x-auto">
              <table className="table table-compact table-zebra w-full">
                {/* head*/}
                <thead>
                  <tr className="bg-primary">
                    <th>Name</th>
                    <th>Date</th>
                    <th>Presentation PDF</th>
                    <th>Battery Check Slide</th>
                    <th>Survey Slide</th>
                    <th>QR</th>
                    <th>Link</th>
                    <th>Reset</th>
                    <th>Delete</th>
                  </tr>
                </thead>
                <tbody>
                  {data.length > 0 && data.map((event: ResponseEvent) => {

                    return (
                      <tr key={event.id} className="hover">
                        <td>{event.name}</td>
                        <td>{formatDate(event.date)}</td>
                        <td><a target="_blank" href={event.pdfUrl}><button className="btn btn-xs btn-primary">Download PDF</button></a></td>
                        <td>{event.batteryCheckSlideNumber}</td>
                        <td>{event.surveySlideNumber}</td>
                        <td><button className="btn btn-xs btn-primary" onClick={() => openQrModal(event)}>QR</button></td>
                        <td><a target="_blank" href={generatePresentationLink(event.name)}><button className="btn btn-xs btn-primary">OPEN</button></a></td>
                        <td><button className="btn btn-xs btn-primary" onClick={() => openConfirmationModal(event)}>RESET</button></td>
                        <td><button className="btn btn-xs btn-error" onClick={() => { setEventId(event.id); setEventName(event.name); setShowDeleteModal(true); }}>DELETE</button></td>
                      </tr>
                    );
                  })}
                  {!data.length &&
                    <p>NO EVENTS</p>
                  }
                </tbody>
              </table>
            </div>
          }
        </div>
      </div>

      <input type="checkbox" id="my-modal" className="modal-toggle" checked={showModal} readOnly />
      <div className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Reset {eventName} results?</h3>

          <label>Are you sure you want to reset the presentation?</label>

          <div className="flex flex-row justify-evenly">
            <div className="modal-action">
              <label onClick={() => setShowModal(false)} htmlFor="my-modal" className="btn btn-primary">No</label>
            </div>
            <div className="modal-action">
              <label onClick={() => resetEvent()} htmlFor="my-modal" className="btn btn-primary">Yes</label>
            </div>
          </div>

        </div>
      </div>

      <input type="checkbox" id="delete-modal" className="modal-toggle" checked={showDeleteModal} readOnly />
      <div className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Delete {eventName}?</h3>
          <label>This action cannot be undone.</label>
          <div className="flex flex-row justify-evenly">
            <div className="modal-action">
              <label onClick={() => setShowDeleteModal(false)} htmlFor="delete-modal" className="btn btn-primary">No</label>
            </div>
            <div className="modal-action">
              <label onClick={() => deleteEvent()} htmlFor="delete-modal" className="btn btn-error">Yes, delete</label>
            </div>
          </div>
        </div>
      </div>

      <input type="checkbox" id="qr-modal" className="modal-toggle" checked={showQrModal} readOnly />
      <div className="modal">
        <div className="modal-box">
          <div> QR code for {eventName}</div>
          <div ref={downloadImage.printRef} className="w-full flex flex-col items-center mt-4">
            <QRCode
              value={process.env.NEXT_PUBLIC_BATTERY_CHECK_URL + `?event=${eventName}`}
              size={300}
              fgColor="#005943"
              bgColor="#FFFFFF"
              eyeRadius={15}
            />
          </div>
          <div className="flex flex-row justify-evenly  my-4">
            <label onClick={() => setShowQrModal(false)} htmlFor="my-modal" className="btn btn-primary">Close</label>
            <label onClick={downloadImage.handleDownloadImage} className="btn btn-primary">Download QR</label>
          </div>
        </div>
      </div>

    </div>
  )
}