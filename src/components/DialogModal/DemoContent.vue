<template>
  <div class="dialog_coupon_qr_code">
    <p class="dialog_coupon_qr_code-title">{{ dialogCouponCnName }}</p>
    <p class="dialog_coupon_qr_code-subtitle">
      代碼:{{ dialogCodeId }}
      <!-- {{ $t('coupons.code-field') }}:{{ dialogCodeId }} -->
    </p>
    <QRcode
      v-if="typeof dialogQrcode === 'string' && dialogQrcode !== ''"
      class="dialog_coupon_qr_code-qr_code"
      :qr-code-value="dialogQrcode"
    />
    <div class="dialog_coupon_qr_code-action">
      <v-btn
        :block="true"
        color="primary"
        variant="text"
        @click="emit('close')"
      >
        關閉
        <!-- {{ $t('coupons.coupon-popup-close') }} -->
      </v-btn>
    </div>
  </div>
</template>

<script lang="ts" setup>
const props = defineProps({
  dialogCouponCnName: { type: String, default: null },
  dialogCodeId: { type: String, default: null },
  dialogQrcode: { type: String, default: 'demo-content' }
});
const emit = defineEmits(['close']);
</script>

<style lang="scss" scoped>
.dialog_coupon_qr_code {
  // Display & Box Model
  padding-top: 24px;
  border-radius: 16px;

  // Typography
  text-align: center;

  // Visual
  background: #4f26de;
  box-shadow:
    0px 2px 6px 2px rgba(0, 0, 0, 0.15),
    0px 1px 2px 0px rgba(0, 0, 0, 0.3);
  &-title {
    // Display & Box Model
    padding-bottom: 8px;

    // Typography
    font-family: Noto Sans TC;
    font-size: 1.5rem;
    font-style: normal;
    font-weight: 700;
    text-align: center;
    color: #fff;
  }
  &-subtitle {
    // Display & Box Model
    padding-bottom: 24px;

    // Typography
    font-family: Noto Sans TC;
    font-size: 1rem;
    font-style: normal;
    font-weight: 400;
    text-align: center;
    color: #fff;
  }
  &-qr_code {
    margin: 0 auto 40px auto;
  }
  &-action {
    // Display & Box Model
    padding: 0 140px 0 140px;

    // Typography
    font-family: Noto Sans TC;
    font-size: 1.5rem;
    font-style: normal;
    font-weight: 700;
    line-height: normal;

    // Visual
    background: #fff;
  }
}
</style>

<style lang="scss">
.dialog_coupon_qr_code {
  &-qr_code {
    .qr_code {
      min-width: 256px;
      min-height: 256px;
    }
  }
  &-action {
    .v-btn.v-btn--density-default {
      // Display & Box Model
      height: 80px;

      // Typography
      font-family: Noto Sans TC;
      font-size: 1.5rem;
      font-style: normal;
      font-weight: 700;
      line-height: normal;
      color: #2c64e3;
    }
  }
}
</style>
