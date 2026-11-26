import type { FC } from 'react'
import Moment from 'react-moment'
import styles from './moment-from-now.module.css'

/* A time as how long ago or how soon it is, with the exact time on hover for anyone who needs it. It
 * never wraps, so "3 days ago" stays one phrase in a narrow column. */
export const MomentFromNow: FC<{ date: string | number }> = ({ date }) => <Moment className={styles.time} date={date} fromNow withTitle titleFormat="D MMM YYYY, HH:mm" />
