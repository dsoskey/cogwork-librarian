import React from "react";
import { DEFAULT_OPACITY, DEFAULT_ICON_SIZE } from './base'

export interface DraftmancerIconProps {

}

export function DraftmancerIcon({}: DraftmancerIconProps) {
  const strokeWidth = 8
  return <svg
    width={DEFAULT_ICON_SIZE} height={DEFAULT_ICON_SIZE}
    viewBox="0 0 145.52084 145.52083"
    version="1.1"
    id="svg5"
    xmlSpace="preserve">
    <defs
      id="defs2"><filter
       // style="color-interpolation-filters:sRGB"
       id="filter4103"
       x="-0.1527148"
       y="-0.098928976"
       width="1.322029"
       height="1.2086111"><feFlood
         floodOpacity="0.603922"
         floodColor="rgb(0,0,0)"
         result="flood"
         id="feFlood4093" /><feComposite
      in="flood"
      in2="SourceGraphic"
      operator="in"
      result="composite1"
      id="feComposite4095" /><feGaussianBlur
      in="composite1"
      stdDeviation="3"
      result="blur"
      id="feGaussianBlur4097" /><feOffset
      dx="1"
      dy="1"
      result="offset"
      id="feOffset4099" /><feComposite
      in="SourceGraphic"
      in2="offset"
      operator="over"
      result="composite2"
      id="feComposite4101" /></filter>
      <filter
        // style="color-interpolation-filters:sRGB"
        id="filter4115"
        x="-0.1527148"
        y="-0.098928976"
        width="1.322029"
        height="1.2086111"><feFlood
         floodOpacity="0.603922"
         floodColor="rgb(0,0,0)"
         result="flood"
         id="feFlood4105" />
        <feComposite
          in="flood"
          in2="SourceGraphic"
          operator="in"
          result="composite1"
          id="feComposite4107" />
        <feGaussianBlur
          in="composite1"
          stdDeviation="3"
          result="blur"
          id="feGaussianBlur4109" />
        <feOffset
          dx="1"
          dy="1"
          result="offset"
          id="feOffset4111" />
        <feComposite
          in="SourceGraphic"
          in2="offset"
          operator="over"
          result="composite2"
          id="feComposite4113" /></filter>
      <filter
        // style="color-interpolation-filters:sRGB"
        id="filter4127"
        x="-0.1527148"
        y="-0.098928976"
        width="1.322029"
        height="1.2086111"><feFlood
         floodOpacity="0.603922"
         floodColor="rgb(0,0,0)"
         result="flood"
         id="feFlood4117" />
        <feComposite
          in="flood"
          in2="SourceGraphic"
          operator="in"
          result="composite1"
          id="feComposite4119" />
        <feGaussianBlur
          in="composite1"
          stdDeviation="3"
          result="blur"
          id="feGaussianBlur4121" />
        <feOffset
          dx="1"
          dy="1"
          result="offset"
          id="feOffset4123" />
        <feComposite
          in="SourceGraphic"
          in2="offset"
          operator="over"
          result="composite2"
          id="feComposite4125" /></filter></defs>
    <g
      id="layer1"
      transform="translate(9.9819542,-0.71214777)"><rect
       style={{
         fill:"var(--svg-stroke)",
         fillOpacity: DEFAULT_OPACITY,
         stroke:"var(--svg-stroke)",
         strokeWidth,
         strokeLinecap:"round",
         strokeLinejoin:"round",
         strokeDasharray:"none",
         strokeOpacity:1,
         paintOrder: "fill markers stroke",
         filter:"url(#filter4103)",
       }}
       id="rect354-2"
       width="60.243015"
       height="92.99601"
       x="-14.869877"
       y="35.714462"
       ry="6.4194031"
       transform="rotate(-22.33532,25.051157,13.065445)" />
      <rect
        style={{
          fill:"var(--svg-stroke)",
          fillOpacity: DEFAULT_OPACITY,
          stroke:"var(--svg-stroke)",
          strokeWidth:strokeWidth,
          strokeLinecap:"round",
          strokeLinejoin:"round",
          strokeDasharray: "none",
          strokeOpacity:1,
          paintOrder:"fill markers stroke",
          filter:"url(#filter4115)",
        }}
        id="rect354-2-4"
        width="60.243015"
        height="92.99601"
        x="79.006248"
        y="-9.1765614"
        ry="6.4194031"
        transform="rotate(20.906148,-0.52883386,-13.61519)" />
      <rect
        style={{
          fill:"var(--bkgd-color)",
          fillOpacity:1,
          stroke:"var(--svg-stroke)",
          strokeWidth:strokeWidth,
          strokeLinecap:"round",
          strokeLinejoin:"round",
          strokeDasharray:"none",
          strokeOpacity:1,
          paintOrder:"fill markers stroke",
          filter:"url(#filter4127)",
        }}
        id="rect354"
        width="60.243015"
        height="92.99601"
        x="28.624477"
        y="12.557979"
        ry="6.4194031" /></g></svg>;
}

