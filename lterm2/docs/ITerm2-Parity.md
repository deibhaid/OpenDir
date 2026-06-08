# iTerm2 feature parity matrix (lTerm2)

| iTerm2 feature | lTerm2 status | Notes |
|----------------|---------------|-------|
| Tabs / splits / windows | ✅ via WezTerm | Native mux |
| Python API (`import iterm2`) | 🟡 Phase 1 | Core RPCs; not full API surface |
| Scripts menu + REPL | ⬜ Phase 2 | Planned GTK integration |
| RPC / daemon registration | ⬜ Phase 2 | Needs notification bus |
| Triggers | ⬜ Phase 3 | Regex on pane output |
| Profiles database | ⬜ Phase 3 | WezTerm uses lua config today |
| Shell integration | ✅ via WezTerm | OSC 133 |
| tmux `-CC` native | ⬜ Phase 4 | Use tmux or WezTerm mux domains |
| Hotkey window | ⬜ Phase 3 | Wayland constraints |
| Instant replay | ⬜ Phase 4 | |
| Coprocesses | ⬜ | Low priority |
| Smart selection | 🟡 partial | WezTerm copy mode |
| Image protocol | ✅ | Kitty + iTerm2 protocols |
| GPU rendering | ✅ | WezTerm wgpu |

Legend: ✅ done · 🟡 partial · ⬜ planned
