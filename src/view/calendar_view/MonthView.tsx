import {MouseEvent, useContext, useRef} from "react";
import {DateTime} from "luxon";
import {HolidayUtil} from "lunar-typescript";
import {useAppDispatch, useAppSelector} from "../redux/hooks";
import {selectSelectedItem, updateSelectedItem} from "../redux/selectedItemSlice";
import SelectedItem from "../../entity/SelectedItem";
import {DayItemFooterEntity} from "../../entity/DayItemFooterEntity";
import DayListOfMonthView from "../../entity/DayListOfMonthView";
import {DayItemFooterType, NoteType, SelectedItemType, WeekEnum} from "../../base/enum";
import {PluginContext} from "../context";
import {range} from "../../util/util";
import StatisticLabel from "./StatisticLabel";


function DayItemBody({
                         targetDay,
                         dayListOfMonthView,
                         isSelected
                     }: { targetDay: DateTime, dayListOfMonthView: DayListOfMonthView, isSelected: boolean }) {


    const plugin = useContext(PluginContext)!;

    const today = DateTime.now();

    let style = "d-normal-font";
    if (isSelected) {
        style = style.concat(" month-view-today-selected");
    }
    else if (targetDay.month !== dayListOfMonthView.month) {
        style = style.concat(" month-view-other-month");
    }
    else if (targetDay.hasSame(today, 'year') && targetDay.hasSame(today, 'month') && targetDay.hasSame(today, 'day')) {
        style = style.concat(" month-view-today");
    }

    return <div className={style}>
        {targetDay.day}
        {
            plugin.calendarViewController.getShouldDisplayHolidayInfo()
                ? <DayItemSuperscript targetDate={targetDay} dayListOfMonthView={dayListOfMonthView}
                                      isSelected={isSelected}/>
                : <></>
        }
    </div>
}

function DayItemSuperscript({
                                targetDate,
                                dayListOfMonthView,
                                isSelected
                            }: { targetDate: DateTime, dayListOfMonthView: DayListOfMonthView, isSelected: boolean }) {

    let holiday = HolidayUtil.getHoliday(targetDate.year, targetDate.month, targetDate.day);
    if (holiday === null) {
        return <></>;
    }


    let style = "d-script-font";
    let text: string;
    if (targetDate.month !== dayListOfMonthView.month) {
        style = style.concat(" month-view-other-month");
    }

    if (isSelected) {
        if (holiday.isWork()) {
            text = "班";
        }
        else {
            text = "休";
        }
    }
    else {
        if (holiday.isWork()) {
            style = style.concat(" month-view-work");
            text = "班";
        }
        else {
            style = style.concat(" month-view-rest");
            text = "休";
        }
    }


    return <sup className={style}>{text}</sup>
}

function DayItemFooter({
                           targetDay,
                           dayListOfMonthView,
                           isSelected
                       }: { targetDay: DateTime, dayListOfMonthView: DayListOfMonthView, isSelected: boolean }) {


    let dayItemFooter = new DayItemFooterEntity(targetDay);

    let style = "d-script-font";
    if (isSelected) {
        style = style.concat(" month-view-today-selected");
    }
    else if (targetDay.month !== dayListOfMonthView.month) {
        style = style.concat(" month-view-other-month");
    }
    else if (dayItemFooter.type === DayItemFooterType.FESTIVAL || dayItemFooter.type === DayItemFooterType.SOLAR_TERM) {
        style = style.concat(" month-view-special-date");
    }

    return <div className={style}>{dayItemFooter.text}</div>
}

function DayItem({
                     targetDay,
                     dayListOfMonthView
                 }: { targetDay: DateTime, dayListOfMonthView: DayListOfMonthView }) {

    const dispatch = useAppDispatch();
    const selectedItem = useAppSelector(selectSelectedItem);
    const plugin = useContext(PluginContext)!;

    // 每个日期都可能被选中，提前创建对象以便更新
    const newSelectItem = new SelectedItem();
    newSelectItem.type = SelectedItemType.DAY_ITEM;
    newSelectItem.date = targetDay;

    // 点击日期会更新已选中对象
    const onClickCallback = (e: MouseEvent<HTMLDivElement>) => {
        // 如果发生连击，只有第一次点击才会切换选中对象，并且能够避免干扰双击事件
        if (e.detail === 1) {
            dispatch(updateSelectedItem(newSelectItem));
        }
    }

    // 被选中和未被选中日期的背景颜色不同
    let bodyStyle = "month-view-day-item d-unselected-item";
    const isSelected: boolean = selectedItem.type === SelectedItemType.DAY_ITEM && selectedItem.date.year === targetDay.year && selectedItem.date.month === targetDay.month && selectedItem.date.day === targetDay.day;
    if (isSelected) {
        bodyStyle = "month-view-day-item d-selected-item";
    }

    return <div className={bodyStyle} onClick={onClickCallback}
                onDoubleClick={() => plugin.noteController.openNoteBySelectedItem(selectedItem)}>
        <DayItemBody targetDay={targetDay} dayListOfMonthView={dayListOfMonthView} isSelected={isSelected}/>
        {
            plugin.calendarViewController.getShouldDisplayLunarInfo()
                ? <DayItemFooter targetDay={targetDay} dayListOfMonthView={dayListOfMonthView} isSelected={isSelected}/>
                : <></>
        }
        <StatisticLabel date={DateTime.local(targetDay.year, targetDay.month, targetDay.day)}
                        noteType={NoteType.DAILY}/>
    </div>
}

function WeekIndexItem({targetDay, dayListOfMonthView}: { targetDay: DateTime, dayListOfMonthView: DayListOfMonthView }) {
    let dispatch = useAppDispatch();
    let selectedItem = useAppSelector(selectSelectedItem);
    const plugin = useContext(PluginContext)!;
    const clickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // 根据ISO周号规则确定正确的年份：使用该周的周四来确定年份
    // 因为ISO周号规则中，周四所在的年份决定了这一周属于哪一年
    // 这样可以正确处理跨年的情况（例如：2025年12月29日所在的周，如果周四在2026年，则这一周属于2026年）
    const thursday = targetDay.plus({days: 3});
    // 直接使用周四的日期，它的年份和周号就是正确的（符合ISO周号规则）
    let dateForWeeklyNote = thursday;

    let newSelectItem = new SelectedItem();
    newSelectItem.type = SelectedItemType.WEEK_INDEX_ITEM;
    newSelectItem.date = dateForWeeklyNote;


    // 点击日期会更新已选中对象（仍然使用targetDay用于显示和选择）
    let clickSelectItem = new SelectedItem();
    clickSelectItem.type = SelectedItemType.WEEK_INDEX_ITEM;
    clickSelectItem.date = targetDay;

    // 使用 ref 来跟踪是否发生了双击，防止双击时触发点击事件导致的视图切换
    const onClickCallback = (e: MouseEvent<HTMLDivElement>) => {

        // 清除之前的定时器
        if (clickTimerRef.current) {
            clearTimeout(clickTimerRef.current);
            clickTimerRef.current = null;
            return; // 如果之前有定时器，说明可能是双击，不处理点击事件
        }
        // 延迟处理点击事件，如果在这期间发生双击，定时器会被清除
        clickTimerRef.current = setTimeout(() => {
            if (e.detail === 1) {
                dispatch(updateSelectedItem(clickSelectItem));
            }
            clickTimerRef.current = null;
        }, 200); // 200ms 延迟，足够检测双击
    }

    const onDoubleClickCallback = (e: MouseEvent<HTMLDivElement>) => {
        // 清除点击事件的定时器，防止触发视图切换
        if (clickTimerRef.current) {
            clearTimeout(clickTimerRef.current);
            clickTimerRef.current = null;
        }
        // 直接创建周记，不更新 selectedItem，避免视图切换
        plugin.noteController.openNoteBySelectedItem(newSelectItem);
    }

    let itemStyle = "month-view-week-index-item d-unselected-item";
    if (selectedItem.type === SelectedItemType.WEEK_INDEX_ITEM && selectedItem.date.weekNumber === targetDay.weekNumber) {
        itemStyle = "month-view-week-index-item d-selected-item";
    }

    return <div className={itemStyle} onClick={onClickCallback}
                onDoubleClick={onDoubleClickCallback}>
        <div>{targetDay.weekNumber}</div>
        <StatisticLabel date={DateTime.local(targetDay.year, targetDay.month, targetDay.day)}
                        noteType={NoteType.WEEKLY}/>
    </div>
}


function MonthViewRow({
                          dayListOfMonthView,
                          weekIndex
                      }: { dayListOfMonthView: DayListOfMonthView, weekIndex: number }) {

    let monday = dayListOfMonthView.getDayByWeek(weekIndex, WeekEnum.MONDAY);
    let tuesday = dayListOfMonthView.getDayByWeek(weekIndex, WeekEnum.TUESDAY);
    let wednesday = dayListOfMonthView.getDayByWeek(weekIndex, WeekEnum.WEDNESDAY);
    let thursday = dayListOfMonthView.getDayByWeek(weekIndex, WeekEnum.THURSDAY);
    let friday = dayListOfMonthView.getDayByWeek(weekIndex, WeekEnum.FRIDAY);
    let saturday = dayListOfMonthView.getDayByWeek(weekIndex, WeekEnum.SATURDAY);
    let sunday = dayListOfMonthView.getDayByWeek(weekIndex, WeekEnum.SUNDAY);


    return <div className='calendar-view-row'>
        <WeekIndexItem targetDay={monday} dayListOfMonthView={dayListOfMonthView}/>
        <DayItem targetDay={monday} dayListOfMonthView={dayListOfMonthView}/>
        <DayItem targetDay={tuesday} dayListOfMonthView={dayListOfMonthView}/>
        <DayItem targetDay={wednesday} dayListOfMonthView={dayListOfMonthView}/>
        <DayItem targetDay={thursday} dayListOfMonthView={dayListOfMonthView}/>
        <DayItem targetDay={friday} dayListOfMonthView={dayListOfMonthView}/>
        <DayItem targetDay={saturday} dayListOfMonthView={dayListOfMonthView}/>
        <DayItem targetDay={sunday} dayListOfMonthView={dayListOfMonthView}/>
    </div>
}

function MonthViewHeader() {
    return <div className='month-view-header'>
        <div className="month-view-header-item">周</div>
        <div className="month-view-header-item">一</div>
        <div className="month-view-header-item">二</div>
        <div className="month-view-header-item">三</div>
        <div className="month-view-header-item">四</div>
        <div className="month-view-header-item">五</div>
        <div className="month-view-header-item">六</div>
        <div className="month-view-header-item">日</div>
    </div>
}

export default function MonthView({dayListOfMonthView}: { dayListOfMonthView: DayListOfMonthView }) {

    let totalWeeks: number = dayListOfMonthView.totalWeeks;

    return <div className="calendar-view-body">
        <MonthViewHeader/>
        {
            range(0, totalWeeks).map((v) => {
                return <MonthViewRow dayListOfMonthView={dayListOfMonthView} weekIndex={v} key={v}/>
            })
        }
    </div>
}