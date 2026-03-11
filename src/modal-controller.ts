let openModal: any;

export function registerModal(fn: any) {
  openModal = fn;
}

export function launchModal(config: any) {
  if (!openModal) {
    throw new Error("Paystack modal not mounted");
  }

  return openModal(config);
}
