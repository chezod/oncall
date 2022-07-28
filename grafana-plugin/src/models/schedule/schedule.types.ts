import { GrafanaTeam } from 'models/grafana_team/grafana_team.types';
import { SlackChannel } from 'models/slack_channel/slack_channel.types';
import { User } from 'models/user/user.types';
import { UserGroup } from 'models/user_group/user_group.types';

export enum ScheduleType {
  'Calendar',
  'Ical',
  'API',
}

export interface Schedule {
  id: string;
  ical_url_primary: string;
  ical_url_overrides: string;
  name: string;
  type: ScheduleType;
  slack_channel: SlackChannel;
  warnings: string[];
  user_group: UserGroup;
  send_empty_shifts_report: boolean;
  team: GrafanaTeam | null;
  on_call_now: User[];
  notify_oncall_shift_freq: number;
  mention_oncall_next: boolean;
  mention_oncall_start: boolean;
  notify_empty_oncall: number;
}

export interface ScheduleEvent {
  all_day: boolean;
  end: string;
  priority_level: string;
  source: string;
  start: string;
  users: User[];
  is_empty: boolean;
  is_gap: boolean;
  missing_users: string[];
}

export interface CreateScheduleExportTokenResponse {
  token: string;
  created_at: string;
  export_url: string;
}

export interface Shift {
  by_day: null;
  frequency: number;
  id: string;
  interval: null;
  priority_level: number;
  rolling_users: Array<Array<User['pk']>>;
  rotation_start: string;
  schedule: Schedule['id'];
  shift_end: string;
  shift_start: string;
  title: string;
  type: 2;
  until: null;
  updated_shift: null;
}

export interface Rotation {
  id: string;
  shifts: Shift[];
}

export type RotationType = 'final' | 'rotation' | 'override';

export interface Event {
  all_day: boolean;
  calendar_type: 0;
  end: string;
  is_empty: boolean;
  is_gap: boolean;
  missing_users: [];
  priority_level: number;
  shift: { pk: string };
  source: string;
  start: string;
  users: [{ display_name: User['username']; pk: User['pk'] }];
}

export interface Events {
  events: Event[];
  id: string;
  name: string;
  type: number; //?
}
