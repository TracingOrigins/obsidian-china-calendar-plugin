import {createContext} from "react";
import ChinaCalendarPlugin from "../main";

export const PluginContext = createContext<ChinaCalendarPlugin | undefined>(undefined);
