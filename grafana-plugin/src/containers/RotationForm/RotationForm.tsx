import React, { FC, useCallback, useState } from 'react';

import { dateTime, DateTime } from '@grafana/data';
import {
  IconButton,
  VerticalGroup,
  HorizontalGroup,
  Field,
  Input,
  Button,
  DateTimePicker,
  Select,
  InlineSwitch,
} from '@grafana/ui';
import cn from 'classnames/bind';
import dayjs from 'dayjs';
import Draggable from 'react-draggable';

import Modal from 'components/Modal/Modal';
import Text from 'components/Text/Text';
import UserGroups from 'components/UserGroups/UserGroups';
import WithConfirm from 'components/WithConfirm/WithConfirm';
import RemoteSelect from 'containers/RemoteSelect/RemoteSelect';
import { Rotation, Schedule, Shift } from 'models/schedule/schedule.types';
import { getTzOffsetString } from 'models/timezone/timezone.helpers';
import { Timezone } from 'models/timezone/timezone.types';
import { User } from 'models/user/user.types';
import { getUTCString } from 'pages/schedule/Schedule.helpers';
import { SelectOption } from 'state/types';
import { useStore } from 'state/useStore';

import { RotationCreateData } from './RotationForm.types';

import styles from './RotationForm.module.css';

interface RotationFormProps {
  layerIndex: number;
  onHide: () => void;
  currentTimezone: Timezone;
  scheduleId: Schedule['id'];
  shiftId: Shift['id'] | 'new';
  onCreate: () => void;
  onUpdate: () => void;
}

const cx = cn.bind(styles);

const RotationForm: FC<RotationFormProps> = (props) => {
  const { onHide, onCreate, currentTimezone, scheduleId, onUpdate, layerIndex, shiftId } = props;

  const [repeatEveryValue, setRepeatEveryValue] = useState<number>(1);
  const [repeatEveryPeriod, setRepeatEveryPeriod] = useState<number>(0);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [shiftStart, setShiftStart] = useState<DateTime>(dateTime('2022-07-26 12:00:00'));
  const [shiftEnd, setShiftEnd] = useState<DateTime>(dateTime('2022-07-26 19:00:00'));
  const [rotationStart, setRotationStart] = useState<DateTime>(dateTime('2022-07-26 12:00:00'));
  const [endLess, setEndless] = useState<boolean>(true);
  const [rotationEnd, setRotationEnd] = useState<DateTime>(dateTime('2022-08-26 12:00:00'));

  const [userGroups, setUserGroups] = useState([['U9XM1G7KTE3KW'], ['UYKS64M6C59XM']]);

  const getUser = (pk: User['pk']) => {
    return {
      name: store.userStore.items[pk]?.username,
      desc: store.userStore.items[pk]?.timezone,
    };
  };

  const handleDeleteClick = useCallback(() => {
    store.scheduleStore.deleteOncallShift(shiftId).then(() => {
      onHide();
      onUpdate();
    });
  }, []);

  const store = useStore();

  const shift = store.scheduleStore.shifts[shiftId];

  const handleCreate = useCallback(() => {
    /* console.log(
      repeatEveryValue,
      repeatEveryPeriod,
      selectedDays,
      shiftStart,
      shiftEnd,
      rotationStart,
      endLess,
      rotationEnd
    );
    */

    const params = {
      title: 'Rotation ' + Math.floor(Math.random() * 100),
      rotation_start: getUTCString(rotationStart, currentTimezone),
      until: endLess ? null : getUTCString(rotationEnd, currentTimezone),
      shift_start: getUTCString(shiftStart, currentTimezone),
      shift_end: getUTCString(shiftEnd, currentTimezone),
      rolling_users: userGroups.filter((group) => group.length),
      frequency: repeatEveryPeriod,
      by_day: repeatEveryPeriod === 1 ? selectedDays : null,
      priority_level: layerIndex + 1,
    };

    // console.log('params', params);

    store.scheduleStore.createRotation(scheduleId, false, params).then(() => {
      onHide();
      onCreate();
    });
  }, [
    repeatEveryValue,
    repeatEveryPeriod,
    selectedDays,
    shiftStart,
    shiftEnd,
    rotationStart,
    endLess,
    rotationEnd,
    userGroups,
    layerIndex,
  ]);

  const handleChangeEndless = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setEndless(!event.currentTarget.checked);
    },
    [endLess]
  );

  const handleRepeatEveryValueChange = useCallback((option) => {
    setRepeatEveryValue(option.value);
  }, []);

  const handleRepeatEveryPeriodChange = useCallback((option) => {
    setRepeatEveryPeriod(option.value);
  }, []);

  const moment = dayjs();

  return (
    <Modal
      width="430px"
      onDismiss={onHide}
      contentElement={(props, children) => (
        <Draggable handle=".drag-handler" positionOffset={{ x: 0, y: 0 }}>
          <div {...props}>{children}</div>
        </Draggable>
      )}
    >
      <VerticalGroup>
        <HorizontalGroup justify="space-between">
          <Text size="medium">{shiftId === 'new' ? 'New Rotation' : shift?.title}</Text>
          <HorizontalGroup>
            <IconButton disabled variant="secondary" tooltip="Copy" name="copy" />
            <IconButton disabled variant="secondary" tooltip="Code" name="brackets-curly" />
            {shiftId !== 'new' && (
              <WithConfirm>
                <IconButton variant="secondary" tooltip="Delete" name="trash-alt" onClick={handleDeleteClick} />
              </WithConfirm>
            )}
            <IconButton variant="secondary" className={cx('drag-handler')} name="draggabledots" />
          </HorizontalGroup>
        </HorizontalGroup>
        <UserGroups value={userGroups} onChange={setUserGroups} isMultipleGroups={true} getItemData={getUser} />
        {/*<hr />*/}
        <VerticalGroup>
          <HorizontalGroup>
            <Field className={cx('control')} label="Repeat shifts every">
              <Select
                value={repeatEveryValue}
                options={[
                  { label: '1', value: 1 },
                  { label: '2', value: 2 },
                  { label: '3', value: 3 },
                  { label: '4', value: 4 },
                  { label: '5', value: 5 },
                  { label: '6', value: 6 },
                ]}
                onChange={handleRepeatEveryValueChange}
              />
            </Field>
            <Field className={cx('control')} label="">
              <RemoteSelect
                href="/oncall_shifts/frequency_options/"
                value={repeatEveryPeriod}
                onChange={setRepeatEveryPeriod}
              />
            </Field>
          </HorizontalGroup>
          {repeatEveryPeriod === 1 && (
            /*<HorizontalGroup justify="center">*/
            <Field label="Select days to repeat">
              <DaysSelector
                options={store.scheduleStore.byDayOptions}
                value={selectedDays}
                onChange={(value) => setSelectedDays(value)}
              />
            </Field>
            /*</HorizontalGroup>*/
          )}
          <HorizontalGroup>
            <Field
              className={cx('date-time-picker')}
              label={
                <Text type="primary" size="small">
                  Shift start
                </Text>
              }
            >
              <DateTimePicker date={shiftStart} onChange={setShiftStart} />
            </Field>
            <Field
              className={cx('date-time-picker')}
              label={
                <Text type="primary" size="small">
                  Shift end
                </Text>
              }
            >
              <DateTimePicker date={shiftEnd} onChange={setShiftEnd} />
            </Field>
          </HorizontalGroup>
          <HorizontalGroup>
            <Field
              className={cx('date-time-picker')}
              label={
                <Text type="primary" size="small">
                  Rotation start
                </Text>
              }
            >
              <DateTimePicker date={rotationStart} onChange={setRotationStart} />
            </Field>
            <Field
              label={
                <HorizontalGroup spacing="xs">
                  <Text type="primary" size="small">
                    Rotation end
                  </Text>
                  <InlineSwitch
                    className={cx('inline-switch')}
                    transparent
                    value={!endLess}
                    onChange={handleChangeEndless}
                  />
                </HorizontalGroup>
              }
            >
              {endLess ? (
                <Input
                  value="endless"
                  onClick={() => {
                    setEndless(false);
                  }}
                />
              ) : (
                <DateTimePicker date={rotationEnd} onChange={setRotationEnd} />
              )}
            </Field>
          </HorizontalGroup>
        </VerticalGroup>
        <HorizontalGroup justify="space-between">
          <Text type="secondary">Timezone: {getTzOffsetString(dayjs().tz(currentTimezone))}</Text>
          <HorizontalGroup>
            <Button variant="secondary">+ Override</Button>
            <Button variant="primary" onClick={handleCreate}>
              Create
            </Button>
          </HorizontalGroup>
        </HorizontalGroup>
      </VerticalGroup>
    </Modal>
  );
};

interface DaysSelectorProps {
  value: string[];
  onChange: (value: string[]) => void;
  options: SelectOption[];
}

const DaysSelector = ({ value, onChange, options }: DaysSelectorProps) => {
  const getDayClickHandler = (day: string) => {
    return () => {
      const newValue = [...value];
      if (newValue.includes(day)) {
        const index = newValue.indexOf(day);
        newValue.splice(index, 1);
      } else {
        newValue.push(day);
      }
      onChange(newValue);
    };
  };

  return (
    <div className={cx('days')}>
      {options.map(({ display_name, value: itemValue }) => (
        <div
          onClick={getDayClickHandler(itemValue as string)}
          className={cx('day', { day__selected: value.includes(itemValue as string) })}
        >
          {display_name.charAt(0)}
        </div>
      ))}
    </div>
  );
};

export default RotationForm;
