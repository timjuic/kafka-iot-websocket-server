CREATE TABLE IF NOT EXISTS filter_settings (
  event TEXT PRIMARY KEY,
  enabled BOOLEAN
);

INSERT INTO filter_settings (event, enabled) VALUES ('motion', 1);
INSERT INTO filter_settings (event, enabled) VALUES ('door', 1);
INSERT INTO filter_settings (event, enabled) VALUES ('vibration', 1);
INSERT INTO filter_settings (event, enabled) VALUES ('sound', 1);
INSERT INTO filter_settings (event, enabled) VALUES ('temperature', 1);
INSERT INTO filter_settings (event, enabled) VALUES ('humidity', 1);