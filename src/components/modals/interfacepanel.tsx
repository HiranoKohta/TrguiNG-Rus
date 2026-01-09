/**
 * TrguiNG - next gen remote GUI for transmission torrent daemon
 * Copyright (C) 2023  qu1ck (mail at qu1ck.org)
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import React, { useCallback, useEffect, useState } from "react";
import type { ColorScheme } from "@mantine/core";
import { Box, Checkbox, Grid, HoverCard, MultiSelect, NativeSelect, NumberInput, Tabs, Text, Textarea, useMantineTheme } from "@mantine/core";
import type { UseFormReturnType } from "@mantine/form";
import ColorChooser from "components/colorchooser";
import { useGlobalStyleOverrides } from "themehooks";
import { AddTorrentPriorityOptions, AddTorrentStartOptions, DateFormatOptions, DeleteTorrentDataOptions, TimeFormatOptions } from "config";
import type { AddTorrentPriorityOption, AddTorrentStartOption, ColorSetting, DateFormatOption, DeleteTorrentDataOption, StyleOverrides, TimeFormatOption } from "config";
import { ColorSchemeToggle } from "components/miscbuttons";
import { Label } from "./common";
import * as Icon from "react-bootstrap-icons";
const { TAURI, invoke } = await import(/* webpackChunkName: "taurishim" */"taurishim");

export interface InterfaceFormValues {
    interface: {
        theme?: ColorScheme,
        styleOverrides: StyleOverrides,
        skipAddDialog: boolean,
        addTorrentStart: AddTorrentStartOption,
        addTorrentPriority: AddTorrentPriorityOption,
        deleteTorrentData: DeleteTorrentDataOption,
        animatedProgressbars: boolean,
        colorfulProgressbars: boolean,
        numLastSaveDirs: number,
        sortLastSaveDirs: boolean,
        preconfiguredLabels: string[],
        preconfiguredDirs: string[],
        ignoredTrackerPrefixes: string[],
        defaultTrackers: string[],
        useCustomDateTimeFormat: boolean,
        dateFormat: DateFormatOption,
        timeFormat: TimeFormatOption,
    },
}

export function InterfaceSettigsPanel<V extends InterfaceFormValues>(props: { form: UseFormReturnType<V> }) {
    const theme = useMantineTheme();
    const { style, setStyle } = useGlobalStyleOverrides();
    const [systemFonts, setSystemFonts] = useState<string[]>(["Default"]);

    useEffect(() => {
        if (TAURI) {
            invoke<string[]>("list_system_fonts").then((fonts) => {
                fonts.sort();
                setSystemFonts(["Default"].concat(fonts));
            }).catch(console.error);
        } else {
            setSystemFonts(["Default", "Arial", "Verdana", "Tahoma", "Roboto"]);
        }
    }, []);

    const { setFieldValue, setFieldError, clearFieldError } = props.form as unknown as UseFormReturnType<InterfaceFormValues>;

    useEffect(() => {
        setFieldValue("interface.theme", theme.colorScheme);
    }, [setFieldValue, theme]);

    const setTextColor = useCallback((color: ColorSetting | undefined) => {
        const newStyle = { dark: { ...style.dark }, light: { ...style.light }, font: style.font };
        newStyle[theme.colorScheme].color = color;
        setStyle(newStyle);
        setFieldValue("interface.styleOverrides", newStyle);
    }, [style, theme.colorScheme, setStyle, setFieldValue]);

    const setBgColor = useCallback((backgroundColor: ColorSetting | undefined) => {
        const newStyle = { dark: { ...style.dark }, light: { ...style.light }, font: style.font };
        newStyle[theme.colorScheme].backgroundColor = backgroundColor;
        setStyle(newStyle);
        setFieldValue("interface.styleOverrides", newStyle);
    }, [style, theme.colorScheme, setStyle, setFieldValue]);

    const setFont = useCallback((font: string) => {
        const newStyle = {
            dark: { ...style.dark },
            light: { ...style.light },
            font: font === "Default" ? undefined : font,
        };
        setStyle(newStyle);
        setFieldValue("interface.styleOverrides", newStyle);
    }, [style, setStyle, setFieldValue]);

    const defaultColor = theme.colorScheme === "dark"
        ? { color: "dark", shade: 0, computed: theme.colors.dark[0] }
        : { color: "dark", shade: 9, computed: theme.colors.dark[9] };

    const defaultBg = theme.colorScheme === "dark"
        ? { color: "dark", shade: 7, computed: theme.colors.dark[7] }
        : { color: "gray", shade: 0, computed: theme.colors.gray[0] };

    const setPreconfiguredLabels = useCallback((labels: string[]) => {
        setFieldValue("interface.preconfiguredLabels", labels);
    }, [setFieldValue]);

    const setIgnoredTrackerPrefixes = useCallback((prefixes: string[]) => {
        try {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const _ = new RegExp(`^(?<prefix>(${prefixes.join("|")})\\d*)\\.[^.]+\\.[^.]+$`, "i");
            setFieldValue("interface.ignoredTrackerPrefixes", prefixes);
            clearFieldError("interface.ignoredTrackerPrefixes");
        } catch {
            setFieldError("interface.ignoredTrackerPrefixes", "Invalid regex");
        }
    }, [setFieldValue, setFieldError, clearFieldError]);

    return (
        <Tabs defaultValue="appearance" orientation="vertical" mih="29rem">
            <Tabs.List>
                <Tabs.Tab value="appearance" p="lg">Оформление</Tabs.Tab>
                <Tabs.Tab value="downloads" p="lg">Загрузки</Tabs.Tab>
                <Tabs.Tab value="miscellaneous" p="lg">Прочие</Tabs.Tab>
            </Tabs.List>
            <Tabs.Panel value="appearance" p="lg">
                <Grid align="center">
                    <Grid.Col span={6}>
                        Тема
                    </Grid.Col>
                    <Grid.Col span={6}>
                        <ColorSchemeToggle />
                    </Grid.Col>
                    <Grid.Col span={6}>
                        Шрифт
                    </Grid.Col>
                    <Grid.Col span={6}>
                        <NativeSelect data={systemFonts} value={style.font} onChange={(e) => { setFont(e.currentTarget.value); }} />
                    </Grid.Col>
                    <Grid.Col span={6}>
                        Цвет текста
                    </Grid.Col>
                    <Grid.Col span={6}>
                        <ColorChooser value={style[theme.colorScheme].color ?? defaultColor} onChange={setTextColor} />
                    </Grid.Col>
                    <Grid.Col span={6}>
                        Фон
                    </Grid.Col>
                    <Grid.Col span={6}>
                        <ColorChooser value={style[theme.colorScheme].backgroundColor ?? defaultBg} onChange={setBgColor} />
                    </Grid.Col>
                    <Grid.Col span={6}>Стиль индикатора прогресса</Grid.Col>
                    <Grid.Col span={3}>
                        <Checkbox label="Многоцветный"
                            {...props.form.getInputProps("interface.colorfulProgressbars", { type: "checkbox" })} />
                    </Grid.Col>
                    <Grid.Col span={3}>
                        <Checkbox label="Анимированный"
                            {...props.form.getInputProps("interface.animatedProgressbars", { type: "checkbox" })} />
                    </Grid.Col>
                    <Grid.Col>
                        <Checkbox label="Свой формат двты/времени" mt="lg"
                            {...props.form.getInputProps("interface.useCustomDateTimeFormat", { type: "checkbox" })} />
                    </Grid.Col>
                    <Grid.Col span={6}>
                        <NativeSelect data={[...DateFormatOptions]} disabled={!props.form.values.interface.useCustomDateTimeFormat}
                            value={props.form.values.interface.dateFormat}
                            onChange={(e) => { setFieldValue("interface.dateFormat", e.target.value); }} />
                    </Grid.Col>
                    <Grid.Col span={6}>
                        <NativeSelect data={[...TimeFormatOptions]} disabled={!props.form.values.interface.useCustomDateTimeFormat}
                            value={props.form.values.interface.timeFormat}
                            onChange={(e) => { setFieldValue("interface.timeFormat", e.target.value); }} />
                    </Grid.Col>
                </Grid>
            </Tabs.Panel>
            <Tabs.Panel value="downloads" p="lg">
                <Grid align="center">
                    <Grid.Col>
                        <Checkbox label="Пропускать диалог добавления торрента"
                            {...props.form.getInputProps("interface.skipAddDialog", { type: "checkbox" })} />
                    </Grid.Col>
                    <Grid.Col span={6}>
                        Автозапуск новых торрентов
                    </Grid.Col>
                    <Grid.Col span={6}>
                        <NativeSelect data={AddTorrentStartOptions as unknown as string[]}
                            value={props.form.values.interface.addTorrentStart}
                            onChange={(e) => { setFieldValue("interface.addTorrentStart", e.target.value); }} />
                    </Grid.Col>
                    <Grid.Col span={6}>
                        Приоритет новых торрентов
                    </Grid.Col>
                    <Grid.Col span={6}>
                        <NativeSelect data={AddTorrentPriorityOptions as unknown as string[]}
                            value={props.form.values.interface.addTorrentPriority}
                            onChange={(e) => { setFieldValue("interface.addTorrentPriority", e.target.value); }} />
                    </Grid.Col>
                    <Grid.Col>
                        <Checkbox label="Сортировка истории папок по алфавиту" my="lg"
                            {...props.form.getInputProps("interface.sortLastSaveDirs", { type: "checkbox" })} />
                    </Grid.Col>
                    <Grid.Col span={9}>Максимальное количество запоминаемых путей</Grid.Col>
                    <Grid.Col span={3}>
                        <NumberInput
                            min={1}
                            max={100}
                            {...props.form.getInputProps("interface.numLastSaveDirs")} />
                    </Grid.Col>
                    <Grid.Col>
                        <Textarea minRows={6}
                            label="Предопределенные папки (одна на строку)"
                            value={props.form.values.interface.preconfiguredDirs.join("\n")}
                            onChange={(e) => {
                                props.form.setFieldValue(
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    "interface.preconfiguredDirs", e.currentTarget.value.split("\n") as any);
                            }} />
                    </Grid.Col>
                    <Grid.Col>
                        <MultiSelect
                            data={props.form.values.interface.preconfiguredLabels}
                            value={props.form.values.interface.preconfiguredLabels}
                            onChange={setPreconfiguredLabels}
                            label={<Box>
                                <span>Preconfigured labels</span>
                                <HoverCard width={280} shadow="md">
                                    <HoverCard.Target>
                                        <Icon.Question />
                                    </HoverCard.Target>
                                    <HoverCard.Dropdown>
                                        <Text size="sm">
                                            Эти ярлыки всегда будут присутствовать в списке предложений и фильтров,
                                            даже если их нет ни в одном из существующих торрентов.
                                        </Text>
                                    </HoverCard.Dropdown>
                                </HoverCard>
                            </Box>}
                            withinPortal
                            searchable
                            creatable
                            getCreateLabel={(query) => `+ Add ${query}`}
                            onCreate={(query) => {
                                setPreconfiguredLabels([...props.form.values.interface.preconfiguredLabels, query]);
                                return query;
                            }}
                            valueComponent={Label}
                        />
                    </Grid.Col>
                </Grid>
            </Tabs.Panel>
            <Tabs.Panel value="miscellaneous" p="lg">
                <Grid align="center">
                    <Grid.Col span={8}>
                        Удалять торрент вместе с файлами
                    </Grid.Col>
                    <Grid.Col span={4}>
                        <NativeSelect data={DeleteTorrentDataOptions as unknown as string[]}
                            value={props.form.values.interface.deleteTorrentData}
                            onChange={(e) => { setFieldValue("interface.deleteTorrentData", e.target.value); }} />
                    </Grid.Col>
                    <Grid.Col>
                        <MultiSelect
                            data={props.form.values.interface.ignoredTrackerPrefixes}
                            value={props.form.values.interface.ignoredTrackerPrefixes}
                            onChange={setIgnoredTrackerPrefixes}
                            label={<Box>
                                <span>Игнорировать трекеры с префиксом</span>
                                <HoverCard width={380} shadow="md">
                                    <HoverCard.Target>
                                        <Icon.Question />
                                    </HoverCard.Target>
                                    <HoverCard.Dropdown>
                                        <Text size="sm">
                                            Если поддомен трекера выглядит как одна из этих строк + (необязательные) цифры,
                                            он будет опущен. Это влияет на группировку в фильтрах и отображение в столбцах таблицы.
                                            Вы можете использовать здесь регулярное выражение для более гибкой фильтрации,
                                            список будет объединен с помощью &quot;|&quot;.
                                        </Text>
                                    </HoverCard.Dropdown>
                                </HoverCard>
                            </Box>}
                            withinPortal
                            searchable
                            creatable
                            error={props.form.errors["interface.ignoredTrackerPrefixes"]}
                            getCreateLabel={(query) => `+ Add ${query}`}
                            onCreate={(query) => {
                                setIgnoredTrackerPrefixes([...props.form.values.interface.ignoredTrackerPrefixes, query]);
                                return query;
                            }}
                            valueComponent={Label}
                        />
                    </Grid.Col>
                    <Grid.Col>
                        <Textarea minRows={6}
                            label="Список трекеров по умолчанию:"
                            value={props.form.values.interface.defaultTrackers.join("\n")}
                            onChange={(e) => {
                                props.form.setFieldValue(
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    "interface.defaultTrackers", e.currentTarget.value.split("\n") as any);
                            }} />
                    </Grid.Col>
                </Grid>
            </Tabs.Panel>
        </Tabs >
    );
}
