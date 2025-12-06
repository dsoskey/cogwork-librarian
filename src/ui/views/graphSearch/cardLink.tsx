import {useHoverCard} from "../../hooks/useHoverCard";
import {useState} from "react";
import "./cardLink.css";
import React from "react";
import { imageUris } from '../../../api/mtgjson'

interface CardLinkProps {
    name: string
    id: string
    imageSrc?: string;
    hasBack?: boolean;
    onClick?: () => void;
    lockable?: boolean;
}

// TODO: deduplicate when cleaning up existing CardLink resources
export function CardLink({ lockable = false, onClick, imageSrc, name, id, hasBack }: CardLinkProps) {
    const [isLockedOpen, setIsLockedOpen] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const handleMouseEnter = () => {
        setIsOpen(true);
    }

    const handleMouseLeave = () => {
        setIsOpen(false);
    }

    const { handleHover, hoverStyle } = useHoverCard();

    return (
        <>
      <span
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onMouseMove={handleHover}
          className={`card-link ${onClick ? 'clickable' : ''} ${isLockedOpen ? "active" : ''}`}
          title={isLockedOpen
              ? ""
              : (lockable
                  ? "click hovered text to keep image open"
                  : name)
          }
          onClick={() => {
              if (lockable) {
                  setIsLockedOpen(p=>!p)
              }
              onClick?.()
          }}
      >
        {name}
      </span>
            {(isLockedOpen || isOpen) && (
                <div
                    className="popup-container"
                    style={hoverStyle}
                    onClick={() => setIsLockedOpen(false)}
                >
                    <img
                        width={250}
                        className="card-image"
                        src={imageSrc ?? imageUris(id, "front").normal}
                        alt={name}
                    />
                    {hasBack && <img
                      width={250}
                      className="card-image"
                      src={imageUris(id, "back").normal}
                      alt={name}
                    />}
                </div>
            )}
        </>
    );
}