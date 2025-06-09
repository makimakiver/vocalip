import * as React from "react";
import * as Select from "@radix-ui/react-select";
import classnames from "classnames";
import { ChevronDownIcon, ChevronUpIcon, CheckIcon } from "@radix-ui/react-icons";
import styles from "./styles.module.css";

const SelectDemo = () => (
  <Select.Root>
    <Select.Trigger className={styles.Trigger} aria-label="Model">
      <Select.Value placeholder="Select a model…" />
      <Select.Icon className={styles.Icon}>
        <ChevronDownIcon />
      </Select.Icon>
    </Select.Trigger>

    <Select.Portal>
      <Select.Content className={styles.Content}>
        <Select.ScrollUpButton className={styles.ScrollButton}>
          <ChevronUpIcon />
        </Select.ScrollUpButton>

        <Select.Viewport className={styles.Viewport}>
          <Select.Group>
            <Select.Label className={styles.Label}>Models</Select.Label>
            {["elevenLabs", "deepseek", "openai"].map(value => (
              <Select.Item key={value} value={value} className={styles.Item}>
                <Select.ItemText>{value.charAt(0).toUpperCase() + value.slice(1)}</Select.ItemText>
                <Select.ItemIndicator className={styles.Indicator}>
                  <CheckIcon />
                </Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.Group>
        </Select.Viewport>

        <Select.ScrollDownButton className={styles.ScrollButton}>
          <ChevronDownIcon />
        </Select.ScrollDownButton>
      </Select.Content>
    </Select.Portal>
  </Select.Root>
);

export default SelectDemo;
