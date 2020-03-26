import React from "react";
import PropTypes from "prop-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle } from "@fortawesome/free-solid-svg-icons";

import * as ui from "../ui";
import { renderUser } from "../Card/Card";
import useWindowDimensions from "../../util/WindowDimensions";

import "./User.css";

const Placeholder = ({ state, users, me, cidx, idx }) => {
  const { width, height } = useWindowDimensions();

  const compileStyle = () => {
    const layout = renderUser(cidx, { name: "", previousState: "" }, users, me);
    const scale = layout.scale;
    let h = ui.CARD_REL_HEIGHT * height;
    let w = h / ui.CARD_ASPECT;
    h = h * scale;
    w = w * scale;
    let x =
      layout.pos.x * width + layout.absPos.x + w * layout.rPos.x - w / 2 - 3;
    let y =
      layout.pos.y * height + layout.absPos.y + h * layout.rPos.y - h / 2 - 3;
    let opacity = 1;
    if (!users[idx].name || state.name === "login") {
      x += ui.USER_CARD_WIDTH * 3;
      opacity = 0;
    }
    return {
      width: w - 4,
      height: h - 4,
      transform: `translateX(${x}px) translateY(${y}px)`,
      opacity: opacity,
    };
  };
  return (
    <div className="placeholder" style={compileStyle()}>
      <div className="placeholder-inner" />
    </div>
  );
};

Placeholder.propTypes = {
  cidx: PropTypes.number,
  idx: PropTypes.number,
  users: PropTypes.array,
  me: PropTypes.object,
  state: PropTypes.object,
};

const User = ({ state, idx, users, me, toggleReady }) => {
  const cidx = (i) => ui.PYRAMID_CARDS + i * users.length + idx;
  const { width, height } = useWindowDimensions();
  const layout = renderUser(
    cidx(0),
    { name: "", previousState: "" },
    users,
    me
  );
  const scale = layout.scale;
  let h = ui.CARD_REL_HEIGHT * height;
  h = h * scale;
  const w = ui.USER_CARD_WIDTH;
  let x = width - ui.USER_CARD_WIDTH - ui.UI_PAD;
  let y =
    layout.pos.y * height + layout.absPos.y + h * layout.rPos.y - h / 2 - 4;

  const compileStyle = () => {
    let opacity = 1;
    if (!users[idx].name || state.name === "login") {
      x += 3 * ui.USER_CARD_WIDTH;
      opacity = 0;
    }
    return {
      width: w + 8,
      height: h + 8,
      transform: `translateX(${x}px) translateY(${y}px)`,
      opacity: opacity,
    };
  };

  const compileCheckbox = (isme, status) => {
    let opacity = 0;
    if (users[idx].ready) {
      opacity = 1;
    }
    let size = isme ? 32 : 24;
    const ch = height * ui.CARD_REL_HEIGHT * scale;
    const cw = ch / ui.CARD_ASPECT;
    let additional = {};
    if (!isme) {
      x -= 3 * cw * ui.CARD_PYRAMID_X_PAD + (3 / 2) * ui.UI_PAD;
      y = y + h / 2 - size / 2;
    } else if (status) {
      x = ui.UI_PAD;
      opacity = 1 - opacity;
      size = 24;
      additional["width"] = 3 * cw * ui.CARD_PYRAMID_Y_PAD;
    } else {
      x = ui.UI_PAD + cw * ui.CARD_PYRAMID_X_PAD + cw / 2 - size / 2;
      y += h / 2 - size / 2 + ch / 2 + 2 * ui.UI_PAD;
    }
    return {
      ...additional,
      transform: `translateX(${x}px) translateY(${y}px) rotateX(${
        (1 - opacity) * 91
      }deg)`,
      opacity: opacity,
      fontSize: size,
    };
  };

  let statusText = "";
  switch (state.name) {
    case "idle":
      statusText = "Bereit?";
      break;
    case "dealt":
      if (state.previousState === "give") statusText = "Getrunken?";
      break;
    case "give":
      statusText = "Fertig?";
      break;
    default:
      statusText = "Error";
  }

  return (
    <div className="user-full-container">
      {[0, 1, 2].map((i) => (
        <Placeholder
          state={state}
          idx={idx}
          users={users}
          me={me}
          key={cidx(i)}
          cidx={cidx(i)}
        />
      ))}
      {users[idx] !== me ? (
        <div>
          <div className="user-container" style={compileStyle()}>
            <div className="user-info-container">
              <div className="user-title">{users[idx].name}</div>
            </div>
          </div>
          <div className="checkbox" style={compileCheckbox(false, false)}>
            <FontAwesomeIcon icon={faCheckCircle} />
          </div>
        </div>
      ) : (
        <div onClick={toggleReady}>
          <div className="checkbox" style={compileCheckbox(true, false)}>
            <FontAwesomeIcon icon={faCheckCircle} />
          </div>
          <div className="status" style={compileCheckbox(true, true)}>
            {statusText}
          </div>
        </div>
      )}
    </div>
  );
};

User.propTypes = {
  idx: PropTypes.number,
  users: PropTypes.array,
  me: PropTypes.object,
  state: PropTypes.object,
  toggleReady: PropTypes.func,
};
// const User = ({ idx, user, gamestate, total }) => {
//   const { width } = useWindowDimensions();
//   const [hover, setHover] = useState(false);
//   const [clicked, setClicked] = useState(false);
//
//   const clickable = gamestate.name === "give" && idx !== 0;
//
//   const compileStyle = () => {
//     const p = 20;
//     const scale = hover ? 1.0 : 1.0;
//     let w = 450;
//     let h = 150;
//     let y = 2 * p + 200 + (h + p) * (idx - 1);
//     if (idx === 0) {
//       w = 600;
//       h = 200;
//       y = p;
//     }
//     let x = width - p - w * scale;
//     if (gamestate.name === "login") {
//       x = 20 + width;
//     }
//     const el = hover ? 20 : 0;
//     return {
//       width: w,
//       height: h,
//       transform: `translate3d(${x}px, ${y}px, ${el}px) scale(${scale})`,
//       cursor: hover ? "pointer" : "default",
//       background: !clicked ? "#344f5a" : "#ffd840",
//       color: !clicked ? "#fff" : "#264653",
//       opacity: gamestate.name === "login" ? 0.0 : 1.0,
//       transitionDelay: `${0.05 * idx}s`
//     };
//   };
//
//   return (
//     <div
//       className="user-container"
//       style={compileStyle()}
//       onMouseEnter={() => (clickable ? setHover(true) : null)}
//       onMouseLeave={() => (clickable ? setHover(false) : null)}
//       onClick={() => {
//         if (clickable) {
//           setClicked(!clicked);
//         }
//       }}
//     >
//       <div className="user-info-container">
//         <div className="user-info-inner-container">
//           <p className="user-title">{user.name}</p>
//           <p className="user-info">Test</p>
//         </div>
//       </div>
//     </div>
//   );
// };
//
// User.propTypes = {
//   gamestate: PropTypes.objectOf(PropTypes.any),
//   idx: PropTypes.number,
//   user: PropTypes.object,
//   total: PropTypes.number
// };
//
export default User;
