import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot
} from "@mui/lab";
import { Paper, Typography, SxProps, Theme } from "@mui/material";

export interface TimelineItemData {
  title: string;
  highlight?: string;
  date: string;
}

export interface TimelineComponentProps {
  data: TimelineItemData[];
  sx?: SxProps<Theme>;
}


const TimelineComponent: React.FC<TimelineComponentProps> = ({ data, sx }) => {
  return (
    <Timeline
      sx={[
        {
          p: 0,
          m: 0,
          "& .MuiTimelineItem-root:before": {
            flex: 0,
            padding: 0
          }
        },
        ...(Array.isArray(sx) ? sx : [sx])
      ]}
    >
      {data.map((item, index) => (
        <TimelineItem key={`${item.title}-${item.date}${item.highlight ? '-' + item.highlight : ''}`}>
          <TimelineSeparator>
            <TimelineDot
              sx={{
                bgcolor: "#FFC107",
                width: 14,
                height: 14
              }}
            />
            {index !== data.length - 1 && (
              <TimelineConnector
                sx={{
                  bgcolor: "#E0E0E0",
                  width: 2
                }}
              />
            )}
          </TimelineSeparator>

          <TimelineContent sx={{ py: 1 }}>
            <Paper
              elevation={1}
              sx={{
                p: 2,
                borderRadius: 1,
                border: "1px solid #E5E7EB",
                maxWidth: 400
              }}
            >
              <Typography sx={{ fontSize: 14, fontWeight: 500 }}>
                {item.title}{" "}
                <Typography component="span" sx={{ fontWeight: 700 }}>
                  {item.highlight}
                </Typography>
              </Typography>

              <Typography sx={{ fontSize: 12, color: "text.secondary", mt: 0.5 }}>
                {item.date}
              </Typography>
            </Paper>
          </TimelineContent>
        </TimelineItem>
      ))}
    </Timeline>
  );
};

export default TimelineComponent;
