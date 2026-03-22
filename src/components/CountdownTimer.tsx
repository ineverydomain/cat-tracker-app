import { useEffect, useMemo, useState } from "react";
import { StyleSheet } from "react-native";
import { Text } from "react-native-paper";
import { differenceInCalendarDays, startOfDay } from "date-fns";
import colors from "../constants/colors";

export type CountdownTimerProps = {
  examDate: Date;
};

const MINUTE_MS = 60_000;

function getDaysRemaining(examDate: Date, now: Date): number {
  const today = startOfDay(now);
  const exam = startOfDay(examDate);
  return Math.max(0, differenceInCalendarDays(exam, today));
}

function urgencyColor(days: number): string {
  if (days > 90) return colors.success;
  if (days >= 30 && days <= 90) return colors.warning;
  return colors.error;
}

export default function CountdownTimer({ examDate }: CountdownTimerProps) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => {
      setNow(new Date());
    }, MINUTE_MS);
    return () => clearInterval(id);
  }, [examDate]);

  const { days, label, textColor } = useMemo(() => {
    const d = getDaysRemaining(examDate, now);
    const year = examDate.getFullYear();
    return {
      days: d,
      label: `${d} Days to CAT ${year}`,
      textColor: urgencyColor(d),
    };
  }, [examDate, now]);

  return (
    <Text variant="headlineMedium" style={[styles.text, { color: textColor }]}>
      {label}
    </Text>
  );
}

const styles = StyleSheet.create({
  text: {
    fontWeight: "700",
    letterSpacing: 0.25,
  },
});
