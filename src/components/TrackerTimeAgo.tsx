'use client'
import ReactTimeAgo from "react-time-ago";
import TimeAgo from "javascript-time-ago";

import en from "javascript-time-ago/locale/en";
TimeAgo.addDefaultLocale(en);

export default function TrackerTimeAgo({date}: {date: Date}) {
  return (
    <ReactTimeAgo date={date} />
  )
}