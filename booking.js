
(() => {
  const SUPABASE_URL =
    'https://gwczbdjjawsjttzskqms.supabase.co'

  const SUPABASE_KEY =
    'sb_publishable_k2ryjqJ_5Z4Etq2at3Vqhw_VP4Pbykf'

  const client =
    window.supabase.createClient(
      SUPABASE_URL,
      SUPABASE_KEY
    )

  // =========================================================
  // ESTADO
  // =========================================================

 const state = {
  services: [],
  serviceCategories: [],
  professionals: [],

  fixedProfessional: null,
  fixedProfessionalSlug: null,

  selectedServices: [],
  procedureOptions: {},

  serviceOptionGroups: {},
  selectedServiceOptions: {},

  selectedProfessional: 'ANY',

  areaProfessionals: {},
  areaSelectedProfessionals: {},
  serviceCategoryFilter: 'ALL',
  multiAreaSchedule: [],

  selectedDate:
    getLocalDateString(
      new Date()
    ),

  slots: [],
  selectedSlot: null,

  discountCode: null,
  discountType: null,
  discountValue: 0,
  discountAmount: 0,
  discountFinalTotal: null,
  discountSubtotal: null,
}

  // =========================================================
  // ELEMENTOS
  // =========================================================

  const el = {
    serviceCategories:
      document.getElementById(
        'service-categories-container'
      ),

    professionals:
      document.getElementById(
        'professionals-list'
      ),

    date:
      document.getElementById(
        'booking-date'
      ),

    slotsStatus:
      document.getElementById(
        'slots-status'
      ),

    slots:
      document.getElementById(
        'slots-list'
      ),

    nextButton:
      document.getElementById(
        'next-availability-button'
      ),

    nextList:
      document.getElementById(
        'next-availability-list'
      ),

    error:
      document.getElementById(
        'booking-error'
      ),

    success:
      document.getElementById(
        'booking-success'
      ),

    app:
      document.getElementById(
        'booking-app'
      ),

    name:
      document.getElementById(
        'client-name'
      ),

    phone:
      document.getElementById(
        'client-phone'
      ),

    email:
      document.getElementById(
        'client-email'
      ),

    notes:
      document.getElementById(
        'client-notes'
      ),

    confirm:
      document.getElementById(
        'confirm-booking'
      ),

    summaryServices:
      document.getElementById(
        'summary-services'
      ),

    summaryProfessional:
      document.getElementById(
        'summary-professional'
      ),

    summaryDate:
      document.getElementById(
        'summary-date'
      ),

    summaryTime:
      document.getElementById(
        'summary-time'
      ),

    summaryPrice:
      document.getElementById(
        'summary-price'
      ),

      discountCodeInput:
  document.getElementById(
    'discount-code-input'
  ),

applyDiscountCode:
  document.getElementById(
    'apply-discount-code'
  ),

discountCodeMessage:
  document.getElementById(
    'discount-code-message'
  ),

subtotalSummary:
  document.getElementById(
    'subtotal-summary'
  ),

summarySubtotal:
  document.getElementById(
    'summary-subtotal'
  ),

discountSummary:
  document.getElementById(
    'discount-summary'
  ),

summaryDiscount:
  document.getElementById(
    'summary-discount'
  ),

  }

  // =========================================================
  // INICIALIZAÇÃO
  // =========================================================

  init()

  async function init() {
    el.date.min =
      getLocalDateString(
        new Date()
      )

    el.date.value =
      state.selectedDate

    bindEvents()
    setupMobileBookingBar()

    // Verificar se estamos em:
    // oceanpink.pt/gabriela
    await loadFixedProfessionalFromUrl()

    // Existe slug mas não corresponde
    // a nenhuma profissional.
    if (
      state.fixedProfessionalSlug &&
      !state.fixedProfessional
    ) {
      return
    }

    applyFixedProfessionalModeUI()

    await loadServices()

    renderAll()
  }

  // =========================================================
  // PROFISSIONAL FIXA PELO URL
  // Ex.:
  // oceanpink.pt/gabriela
  // =========================================================

  function getProfessionalSlugFromUrl() {
    const parts =
      window.location.pathname
        .split('/')
        .filter(Boolean)

    // Só consideramos um caminho simples:
    // /gabriela
    if (
      parts.length !== 1
    ) {
      return null
    }

    const slug =
      decodeURIComponent(
        parts[0]
      )
        .trim()
        .toLowerCase()

    // Páginas normais do website
    // não são slugs de profissionais.
    const reserved =
      new Set([
        'index',
        'index.html',

        'booking',
        'booking.html',

        'sobre',
        'sobre.html',

        'profissionais',
        'profissionais.html',

        'contacto',
        'contacto.html',
      ])

    if (
      !slug ||
      slug.includes('.') ||
      reserved.has(
        slug
      )
    ) {
      return null
    }

    return slug
  }

  // =========================================================
  // CARREGAR PROFISSIONAL DO URL
  // =========================================================

  async function loadFixedProfessionalFromUrl() {
    const slug =
      getProfessionalSlugFromUrl()

    if (!slug) {
      return
    }

    state.fixedProfessionalSlug =
      slug

    const {
      data,
      error,
    } = await client.rpc(
      'public_get_professional_by_slug',
      {
        p_slug:
          slug,
      }
    )

    if (error) {
      console.error(
        'Erro ao identificar profissional:',
        error
      )

      showError(
        'Não foi possível abrir esta agenda.'
      )

      return
    }

    const professional =
      data?.[0] ||
      null

    if (!professional) {
      showError(
        'Esta agenda não está disponível.'
      )

      return
    }

    state.fixedProfessional =
      professional

    state.selectedProfessional =
      professional.id

    state.professionals = [
      professional,
    ]
  }

  // =========================================================
  // UI DA AGENDA INDIVIDUAL
  // =========================================================

  function applyFixedProfessionalModeUI() {
    if (
      !state.fixedProfessional
    ) {
      return
    }

    // -------------------------------------------------------
    // ESCONDER BLOCO DE ESCOLHA DE PROFISSIONAL
    // -------------------------------------------------------

    const professionalSection =
      el.professionals?.closest(
        '.public-booking-card'
      )

    if (
      professionalSection
    ) {
      professionalSection.hidden =
        true
    }

    // -------------------------------------------------------
    // DATA PASSA A PASSO 2
    // -------------------------------------------------------

    const dateSection =
      el.date?.closest(
        '.public-booking-card'
      )

    const dateNumber =
      dateSection?.querySelector(
        '.public-booking-heading > span'
      )

    if (
      dateNumber
    ) {
      dateNumber.textContent =
        '2'
    }

    // -------------------------------------------------------
    // DADOS DA CLIENTE PASSAM A PASSO 3
    // -------------------------------------------------------

    const clientSection =
      el.name?.closest(
        '.public-booking-card'
      )

    const clientNumber =
      clientSection?.querySelector(
        '.public-booking-heading > span'
      )

    if (
      clientNumber
    ) {
      clientNumber.textContent =
        '3'
    }

    // -------------------------------------------------------
    // TEXTO DO HERO
    // -------------------------------------------------------

    const heroText =
      document.querySelector(
        '#booking-hero .container > p:last-child'
      )

    if (
      heroText
    ) {
      heroText.textContent =
        `Escolha o serviço e o horário que prefere com ${state.fixedProfessional.display_name}.`
    }

    // -------------------------------------------------------
    // TITLE
    // -------------------------------------------------------

    document.title =
      `Marcações com ${state.fixedProfessional.display_name} | Ocean Pink`
  }

  // =========================================================
  // EVENTOS
  // =========================================================

  function bindEvents() {
    el.date.addEventListener(
      'change',
      async () => {
        state.selectedDate =
          el.date.value
 
          state.discountCode = null
state.discountType = null
state.discountValue = 0
state.discountAmount = 0
state.discountFinalTotal = null
state.discountSubtotal = null

if (
  el.discountCodeMessage
) {
  el.discountCodeMessage.textContent =
    ''
}

if (
  el.discountCodeInput
) {
  el.discountCodeInput.value =
    ''
}
        state.selectedSlot =
          null

        state.slots = []

        await loadServices()

        renderServices()

        await loadProfessionals()

        renderProfessionals()

        await loadSlots()

        updateSummary()
      }
    )

    el.nextButton.addEventListener(
      'click',
      searchNextAvailability
    )

    ;[
      el.name,
      el.phone,
      el.email,
      el.notes,
    ].forEach(
      (input) => {
        input.addEventListener(
          'input',
          updateConfirmState
        )
      }
    )

    el.confirm.addEventListener(
      'click',
      createBooking
    )

    el.applyDiscountCode?.addEventListener(
  'click',
  applyDiscountCode
     )
  }

  // =========================================================
  // CARREGAR SERVIÇOS
  // =========================================================

  async function loadServices() {
    showError('')

    const {
      data,
      error,
    } = await client.rpc(
      'public_get_booking_services_with_promotions',
      {
        p_work_date:
          state.selectedDate,
      }
    )

    if (error) {
      console.error(
        'Erro ao carregar serviços:',
        error
      )

      showError(
        'Não foi possível carregar os serviços.'
      )

      return
    }

    state.services =
      data || []

    // =======================================================
    // SECÇÕES / CATEGORIAS DINÂMICAS
    // =======================================================

    const [
      categoriesResult,
      assignmentsResult,
    ] = await Promise.all([
      client.rpc(
        'public_get_service_categories'
      ),

      client.rpc(
        'public_get_booking_service_category_assignments'
      ),
    ])

    if (
      categoriesResult.error
    ) {
      console.error(
        'Erro ao carregar secções dos serviços:',
        categoriesResult.error
      )

      showError(
        'Não foi possível carregar as secções dos serviços.'
      )

      state.serviceCategories =
        []

      return
    }

    if (
      assignmentsResult.error
    ) {
      console.error(
        'Erro ao carregar categorias dos serviços:',
        assignmentsResult.error
      )

      showError(
        'Não foi possível organizar os serviços por secção.'
      )

      state.serviceCategories =
        []

      return
    }

    state.serviceCategories =
      categoriesResult.data || []

    const categoryByService =
      new Map(
        (
          assignmentsResult.data ||
          []
        ).map(
          (item) => [
            item.service_id,
            item.category_id,
          ]
        )
      )

    state.services =
      state.services.map(
        (service) => ({
          ...service,

          category_id:
            categoryByService.get(
              service.id
            ) ||
            null,
        })
      )

    // =======================================================
    // AGENDA INDIVIDUAL
    //
    // Em /gabriela mostrar apenas os serviços
    // que a Gabriela realiza.
    // =======================================================

    if (
      state.fixedProfessional
    ) {
      const {
        data:
          professionalServiceData,

        error:
          professionalServiceError,
      } = await client.rpc(
        'public_get_professional_booking_service_ids',
        {
          p_professional_id:
            state.fixedProfessional.id,
        }
      )

      if (
        professionalServiceError
      ) {
        console.error(
          'Erro ao carregar serviços da profissional:',
          professionalServiceError
        )

        showError(
          'Não foi possível carregar os serviços desta profissional.'
        )

        state.services =
          []

        return
      }

      const allowedIds =
        new Set(
          (
            professionalServiceData ||
            []
          ).map(
            (item) =>
              item.service_id
          )
        )

      state.services =
        state.services.filter(
          (service) =>
            allowedIds.has(
              service.id
            )
        )

      // Remover serviços anteriormente
      // selecionados que já não sejam permitidos.
      state.selectedServices =
        state.selectedServices.filter(
          (serviceId) =>
            allowedIds.has(
              serviceId
            )
        )

      Object.keys(
        state.selectedServiceOptions
      ).forEach(
        (serviceId) => {
          if (
            !allowedIds.has(
              serviceId
            )
          ) {
            delete state
              .selectedServiceOptions[
                serviceId
              ]

            delete state
              .procedureOptions[
                serviceId
              ]
          }
        }
      )
    }

    // =======================================================
    // OPÇÕES DOS SERVIÇOS
    // =======================================================

    const serviceIds =
      state.services.map(
        (service) =>
          service.id
      )

    if (
      !serviceIds.length
    ) {
      state.serviceOptionGroups =
        {}

      return
    }

    const {
      data: optionData,
      error: optionError,
    } = await client.rpc(
      'get_booking_service_options',
      {
        p_service_ids:
          serviceIds,
      }
    )

    if (
      optionError
    ) {
      console.error(
        'Erro ao carregar opções:',
        optionError
      )

      state.serviceOptionGroups =
        {}

      return
    }

    const optionMap =
      {}

    ;(
      optionData ||
      []
    ).forEach(
      (item) => {
        optionMap[
          item.service_id
        ] =
          item.groups ||
          []
      }
    )

    state.serviceOptionGroups =
      optionMap
  }

  // =========================================================
  // RESERVA POR ÁREAS
  // =========================================================

  function getBookingAreaGroups() {
    const groups =
      new Map()

    state.selectedServices.forEach(
      (serviceId) => {
        const service =
          state.services.find(
            (item) =>
              item.id ===
              serviceId
          )

        if (!service) {
          return
        }

        const category =
          state.serviceCategories.find(
            (item) =>
              (
                item.category_id ||
                item.id
              ) ===
              service.category_id
          )

        const areaId =
          category?.area_id ||
          'outros'

        const areaName =
          category?.area_name ||
          'Outros'

        const areaSortOrder =
          Number(
            category
              ?.area_sort_order ??
            9999
          )

        if (
          !groups.has(
            areaId
          )
        ) {
          groups.set(
            areaId,
            {
              areaId,
              areaName,
              areaSortOrder,
              serviceIds: [],
            }
          )
        }

        groups
          .get(
            areaId
          )
          .serviceIds.push(
            serviceId
          )
      }
    )

    return Array.from(
      groups.values()
    ).sort(
      (a, b) =>
        a.areaSortOrder -
          b.areaSortOrder ||
        a.areaName.localeCompare(
          b.areaName,
          'pt-PT',
          {
            sensitivity:
              'base',
          }
        )
    )
  }

  function isMultiAreaBooking() {
    return (
      !state.fixedProfessional &&
      getBookingAreaGroups().length >
        1
    )
  }

  function getGroupProcedureArray(
    group
  ) {
    return group.serviceIds.map(
      (serviceId) =>
        Boolean(
          state
            .procedureOptions[
              serviceId
            ]
        )
    )
  }

  function getGroupOptionSelectionsPayload(
    group
  ) {
    const payload =
      {}

    group.serviceIds.forEach(
      (serviceId) => {
        const ids =
          getSelectedOptionIds(
            serviceId
          )

        if (ids.length) {
          payload[
            serviceId
          ] =
            ids
        }
      }
    )

    return payload
  }

  function permutations(
    items
  ) {
    if (
      items.length <= 1
    ) {
      return [
        items,
      ]
    }

    const result =
      []

    items.forEach(
      (
        item,
        index
      ) => {
        const rest = [
          ...items.slice(
            0,
            index
          ),
          ...items.slice(
            index + 1
          ),
        ]

        permutations(
          rest
        ).forEach(
          (permutation) => {
            result.push([
              item,
              ...permutation,
            ])
          }
        )
      }
    )

    return result
  }

  async function fetchAutoSlotsForArea(
    group,
    date
  ) {
    const selectedProfessional =
      state
        .areaSelectedProfessionals[
          group.areaId
        ] ||
      'ANY'

    const rpcName =
      selectedProfessional ===
      'ANY'
        ? 'public_get_auto_available_slots_with_options'
        : 'public_get_available_slots_with_options'

    const rpcArgs =
      selectedProfessional ===
      'ANY'
        ? {
            p_service_ids:
              group.serviceIds,

            p_has_procedure:
              getGroupProcedureArray(
                group
              ),

            p_work_date:
              date,

            p_option_selections:
              getGroupOptionSelectionsPayload(
                group
              ),
          }
        : {
            p_professional_id:
              selectedProfessional,

            p_service_ids:
              group.serviceIds,

            p_has_procedure:
              getGroupProcedureArray(
                group
              ),

            p_work_date:
              date,

            p_option_selections:
              getGroupOptionSelectionsPayload(
                group
              ),
          }

    const {
      data,
      error,
    } = await client.rpc(
      rpcName,
      rpcArgs
    )

    if (error) {
      console.error(
        `Erro nos horários de ${group.areaName}:`,
        error
      )

      throw error
    }

    return data || []
  }

  async function buildMultiAreaSchedulesForDate(
    date
  ) {
    const groups =
      getBookingAreaGroups()

    if (
      groups.length <= 1 ||
      !requiredOptionsComplete()
    ) {
      return []
    }

    const slotEntries =
      await Promise.all(
        groups.map(
          async (group) => [
            group.areaId,
            await fetchAutoSlotsForArea(
              group,
              date
            ),
          ]
        )
      )

    const slotsByArea =
      Object.fromEntries(
        slotEntries
      )

    if (
      groups.some(
        (group) =>
          !(
            slotsByArea[
              group.areaId
            ] ||
            []
          ).length
      )
    ) {
      return []
    }

    const schedules =
      []

    permutations(
      groups
    ).forEach(
      (orderedGroups) => {
        const firstGroup =
          orderedGroups[0]

        const firstSlots =
          (
            slotsByArea[
              firstGroup.areaId
            ] ||
            []
          ).slice(
            0,
            30
          )

        firstSlots.forEach(
          (firstSlot) => {
            const schedule = [
              {
                group:
                  firstGroup,
                slot:
                  firstSlot,
              },
            ]

            let cursor =
              new Date(
                firstSlot.slot_end
              ).getTime()

            let valid =
              true

            for (
              let index = 1;
              index <
                orderedGroups.length;
              index += 1
            ) {
              const group =
                orderedGroups[
                  index
                ]

              const nextSlot =
                (
                  slotsByArea[
                    group.areaId
                  ] ||
                  []
                ).find(
                  (slot) =>
                    new Date(
                      slot.slot_start
                    ).getTime() >=
                    cursor
                )

              if (!nextSlot) {
                valid =
                  false
                break
              }

              schedule.push({
                group,
                slot:
                  nextSlot,
              })

              cursor =
                new Date(
                  nextSlot.slot_end
                ).getTime()
            }

            if (!valid) {
              return
            }

            const start =
              new Date(
                schedule[0]
                  .slot
                  .slot_start
              ).getTime()

            const finish =
              new Date(
                schedule[
                  schedule.length -
                  1
                ].slot.slot_end
              ).getTime()

            let waitingMs =
              0

            for (
              let index = 1;
              index <
                schedule.length;
              index += 1
            ) {
              waitingMs +=
                Math.max(
                  0,
                  new Date(
                    schedule[
                      index
                    ].slot.slot_start
                  ).getTime() -
                  new Date(
                    schedule[
                      index -
                      1
                    ].slot.slot_end
                  ).getTime()
                )
            }

            schedules.push({
              slot_start:
                schedule[0]
                  .slot
                  .slot_start,

              slot_end:
                schedule[
                  schedule.length -
                  1
                ].slot.slot_end,

              total_duration_minutes:
                Math.round(
                  (
                    finish -
                    start -
                    waitingMs
                  ) /
                  60000
                ),

              total_price:
                calculateBookingTotal(),

              waiting_minutes:
                Math.round(
                  waitingMs /
                  60000
                ),

              schedule:
                schedule.map(
                  (item) => ({
                    area_id:
                      item.group
                        .areaId,

                    area_name:
                      item.group
                        .areaName,

                    service_ids:
                      item.group
                        .serviceIds,

                    has_procedure:
                      getGroupProcedureArray(
                        item.group
                      ),

                    option_selections:
                      getGroupOptionSelectionsPayload(
                        item.group
                      ),

                    professional_id:
                      state
                        .areaSelectedProfessionals[
                          item.group
                            .areaId
                        ] ||
                      'ANY',

                    slot_start:
                      item.slot
                        .slot_start,

                    slot_end:
                      item.slot
                        .slot_end,
                  })
                ),
            })
          }
        )
      }
    )

    schedules.sort(
      (a, b) => {
        const startDiff =
          new Date(
            a.slot_start
          ).getTime() -
          new Date(
            b.slot_start
          ).getTime()

        if (startDiff) {
          return startDiff
        }

        const waitDiff =
          Number(
            a.waiting_minutes ||
            0
          ) -
          Number(
            b.waiting_minutes ||
            0
          )

        if (waitDiff) {
          return waitDiff
        }

        return (
          new Date(
            a.slot_end
          ).getTime() -
          new Date(
            b.slot_end
          ).getTime()
        )
      }
    )

    const unique =
      new Map()

    schedules.forEach(
      (schedule) => {
        const key =
          schedule.slot_start

        if (
          !unique.has(
            key
          )
        ) {
          unique.set(
            key,
            schedule
          )
        }
      }
    )

    return Array.from(
      unique.values()
    ).slice(
      0,
      20
    )
  }

  // =========================================================
  // PROFISSIONAIS
  // =========================================================

  async function loadProfessionals() {
    if (
      state.fixedProfessional
    ) {
      state.professionals = [
        state.fixedProfessional,
      ]

      state.selectedProfessional =
        state.fixedProfessional.id

      return
    }

    if (
      !state.selectedServices.length
    ) {
      state.professionals =
        []

      state.selectedProfessional =
        'ANY'

      return
    }

    // Quando há serviços de várias áreas,
    // carregamos profissionais separadamente por área.
    if (
      isMultiAreaBooking()
    ) {
      const groups =
        getBookingAreaGroups()

      const results =
        await Promise.all(
          groups.map(
            async (group) => {
              const {
                data,
                error,
              } = await client.rpc(
                'public_get_booking_professionals',
                {
                  p_service_ids:
                    group.serviceIds,
                }
              )

              if (error) {
                console.error(
                  `Erro ao carregar profissionais de ${group.areaName}:`,
                  error
                )

                return [
                  group.areaId,
                  [],
                ]
              }

              return [
                group.areaId,
                data || [],
              ]
            }
          )
        )

      state.areaProfessionals =
        Object.fromEntries(
          results
        )

      const nextSelections = {
        ...state
          .areaSelectedProfessionals,
      }

      groups.forEach(
        (group) => {
          const professionals =
            state
              .areaProfessionals[
                group.areaId
              ] ||
            []

          const current =
            nextSelections[
              group.areaId
            ]

          const currentValid =
            current ===
              'ANY' ||
            professionals.some(
              (professional) =>
                professional.id ===
                current
            )

          if (
            professionals.length ===
            1
          ) {
            nextSelections[
              group.areaId
            ] =
              professionals[0].id
          } else if (
            !currentValid
          ) {
            nextSelections[
              group.areaId
            ] =
              'ANY'
          }
        }
      )

      state.areaSelectedProfessionals =
        nextSelections

      state.professionals =
        []

      state.selectedProfessional =
        'MULTI_AREA'

      return
    }

    const {
      data,
      error,
    } = await client.rpc(
      'public_get_booking_professionals',
      {
        p_service_ids:
          state.selectedServices,
      }
    )

    if (error) {
      console.error(
        'Erro ao carregar profissionais:',
        error
      )

      state.professionals =
        []

      showError(
        'Não foi possível carregar as profissionais.'
      )

      return
    }

    state.professionals =
      data || []

    if (
      state.selectedProfessional ===
        'MULTI_AREA' ||
      (
        state.selectedProfessional !==
          'ANY' &&
        !state.professionals.some(
          (professional) =>
            professional.id ===
            state.selectedProfessional
        )
      )
    ) {
      state.selectedProfessional =
        'ANY'
    }
  }

  // =========================================================
  // OPÇÕES DINÂMICAS
  // =========================================================

  function getOptionGroups(
    serviceId
  ) {
    return (
      state
        .serviceOptionGroups[
          serviceId
        ] ||
      []
    )
  }

  function getSelectedOptionIds(
    serviceId
  ) {
    const groups =
      state
        .selectedServiceOptions[
          serviceId
        ] ||
      {}

    return Object.values(
      groups
    ).flat()
  }

  function getOptionSelectionsPayload() {
    const payload =
      {}

    state.selectedServices.forEach(
      (serviceId) => {
        const ids =
          getSelectedOptionIds(
            serviceId
          )

        if (
          ids.length
        ) {
          payload[
            serviceId
          ] =
            ids
        }
      }
    )

    return payload
  }

  function getOptionExtraPrice(
    serviceId
  ) {
    const selectedIds =
      new Set(
        getSelectedOptionIds(
          serviceId
        )
      )

    let total =
      0

    getOptionGroups(
      serviceId
    ).forEach(
      (group) => {
        ;(
          group.options ||
          []
        ).forEach(
          (option) => {
            if (
              selectedIds.has(
                option.id
              )
            ) {
              total +=
                Number(
                  option
                    .price_delta ||
                  0
                )
            }
          }
        )
      }
    )

    return total
  }

  function getMinimumOptionPrice(
    serviceId
  ) {
    const prices =
      getOptionGroups(
        serviceId
      )
        .flatMap(
          (group) =>
            group.options ||
            []
        )
        .map(
          (option) =>
            Number(
              option.price_delta ||
              0
            )
        )
        .filter(
          (value) =>
            Number.isFinite(
              value
            ) &&
            value > 0
        )

    if (!prices.length) {
      return 0
    }

    return Math.min(
      ...prices
    )
  }

  function getServiceDisplayPrice(
    service
  ) {
    const basePrice =
      Number(
        service.price ||
        0
      )

    const selectedExtra =
      getOptionExtraPrice(
        service.id
      )

    const isSelected =
      state.selectedServices.includes(
        service.id
      )

    if (
      isSelected &&
      selectedExtra > 0
    ) {
      return {
        mode: 'TOTAL',
        value:
          basePrice +
          selectedExtra,
      }
    }

    if (basePrice > 0) {
      return {
        mode: 'BASE',
        value:
          basePrice,
      }
    }

    const minimumOptionPrice =
      getMinimumOptionPrice(
        service.id
      )

    if (
      minimumOptionPrice >
      0
    ) {
      return {
        mode: 'FROM',
        value:
          minimumOptionPrice,
      }
    }

    return {
      mode: 'BASE',
      value: 0,
    }
  }

  function requiredOptionsComplete() {
    return state
      .selectedServices
      .every(
        (serviceId) =>
          getOptionGroups(
            serviceId
          ).every(
            (group) => {
              if (
                !group.required
              ) {
                return true
              }

              return (
                (
                  state
                    .selectedServiceOptions[
                      serviceId
                    ]?.[
                      group.id
                    ] ||
                  []
                ).length >
                0
              )
            }
          )
      )
  }

  async function selectServiceOption(
    serviceId,
    group,
    optionId
  ) {
    const serviceSelections = {
      ...(
        state
          .selectedServiceOptions[
            serviceId
          ] ||
        {}
      ),
    }

    const currentIds =
      serviceSelections[
        group.id
      ] ||
      []

    // -------------------------------------------------------
    // SEM OPÇÃO
    // Ex.: Sem Nail Art
    // -------------------------------------------------------

    if (
      optionId ===
      null
    ) {
      if (
        group.required
      ) {
        return
      }

      serviceSelections[
        group.id
      ] = []
    }

    // -------------------------------------------------------
    // SINGLE
    // -------------------------------------------------------

    else if (
      group.selection_type ===
      'SINGLE'
    ) {
      serviceSelections[
        group.id
      ] = [
        optionId,
      ]
    }

    // -------------------------------------------------------
    // MULTIPLE
    // -------------------------------------------------------

    else {
      serviceSelections[
        group.id
      ] =
        currentIds.includes(
          optionId
        )
          ? currentIds.filter(
              (id) =>
                id !==
                optionId
            )
          : [
              ...currentIds,
              optionId,
            ]
    }

    state.selectedServiceOptions[
      serviceId
    ] =
      serviceSelections

    // A opção pode alterar duração.
    state.selectedSlot =
      null

    state.slots =
      []

    renderAll()

    if (
      requiredOptionsComplete()
    ) {
      await loadSlots()
    } else {
      renderSlots()
    }
  }

  // =========================================================
  // RENDER GERAL
  // =========================================================

  function renderAll() {
    renderServices()
    renderProfessionals()
    updateSummary()
    updateConfirmState()
  }

  // =========================================================
  // SERVIÇOS
  // =========================================================

  function renderServices() {
    if (
      !el.serviceCategories
    ) {
      return
    }

    el.serviceCategories.innerHTML =
      ''

    const regularMaintenance =
      state.services.find(
        (service) =>
          getServiceType(
            service
          ) ===
          'manutencao'
      )

    const otherProfessionalMaintenance =
      state.services.find(
        (service) =>
          getServiceType(
            service
          ) ===
          'manutencao-outra'
      )

    const configuredCategories =
      state.serviceCategories
        .map(
          (category) => ({
            ...category,

            normalized_id:
              category.category_id ||
              category.id,

            normalized_name:
              category.category_name ||
              category.name ||
              'Secção',

            normalized_area_sort_order:
              Number(
                category.area_sort_order ??
                9999
              ),

            normalized_category_sort_order:
              Number(
                category.category_sort_order ??
                category.sort_order ??
                9999
              ),
          })
        )
        .filter(
          (category) =>
            category.normalized_id
        )
        .sort(
          (a, b) =>
            a.normalized_area_sort_order -
              b.normalized_area_sort_order ||
            a.normalized_category_sort_order -
              b.normalized_category_sort_order ||
            String(
              a.normalized_name
            ).localeCompare(
              String(
                b.normalized_name
              ),
              'pt-PT',
              {
                sensitivity:
                  'base',
              }
            )
        )

    // =======================================================
    // FILTRO DINÂMICO POR SECÇÃO
    // =======================================================

    const filterCategories =
      configuredCategories.filter(
        (category) =>
          state.services.some(
            (service) =>
              service.category_id ===
              category.normalized_id &&
              getServiceType(
                service
              ) !==
              'manutencao-outra'
          )
      )

    if (
      filterCategories.length >
      1
    ) {
      const filters =
        document.createElement(
          'div'
        )

      filters.className =
        'public-service-filters'

      const allButton =
        document.createElement(
          'button'
        )

      allButton.type =
        'button'

      allButton.className =
        `public-service-filter${
          state.serviceCategoryFilter ===
          'ALL'
            ? ' selected'
            : ''
        }`

      allButton.textContent =
        'Todos'

      allButton.addEventListener(
        'click',
        () => {
          state.serviceCategoryFilter =
            'ALL'

          renderServices()
        }
      )

      filters.appendChild(
        allButton
      )

      filterCategories.forEach(
        (category) => {
          const button =
            document.createElement(
              'button'
            )

          button.type =
            'button'

          button.className =
            `public-service-filter${
              state.serviceCategoryFilter ===
              category.normalized_id
                ? ' selected'
                : ''
            }`

          button.textContent =
            category.normalized_name

          button.addEventListener(
            'click',
            () => {
              state.serviceCategoryFilter =
                category.normalized_id

              renderServices()
            }
          )

          filters.appendChild(
            button
          )
        }
      )

      el.serviceCategories.appendChild(
        filters
      )
    }

    const knownCategoryIds =
      new Set(
        configuredCategories.map(
          (category) =>
            category.normalized_id
        )
      )

    configuredCategories.forEach(
      (category) => {
        if (
          state.serviceCategoryFilter !==
            'ALL' &&
          state.serviceCategoryFilter !==
            category.normalized_id
        ) {
          return
        }

        const categoryServices =
          state.services
            .filter(
              (service) => {
                if (
                  service.category_id !==
                  category.normalized_id
                ) {
                  return false
                }

                return (
                  getServiceType(
                    service
                  ) !==
                  'manutencao-outra'
                )
              }
            )
            .sort(
              (a, b) =>
                String(
                  a.name ||
                  ''
                ).localeCompare(
                  String(
                    b.name ||
                    ''
                  ),
                  'pt-PT',
                  {
                    sensitivity:
                      'base',
                  }
                )
            )

        if (
          !categoryServices.length
        ) {
          return
        }

        const section =
          document.createElement(
            'div'
          )

        section.className =
          'public-service-category'

        const heading =
          document.createElement(
            'h3'
          )

        heading.textContent =
          category.normalized_name

        const list =
          document.createElement(
            'div'
          )

        list.className =
          'public-services-list'

        categoryServices.forEach(
          (service) => {
            list.appendChild(
              serviceCard(
                service,
                regularMaintenance,
                otherProfessionalMaintenance
              )
            )
          }
        )

        section.appendChild(
          heading
        )

        section.appendChild(
          list
        )

        el.serviceCategories.appendChild(
          section
        )
      }
    )

    const uncategorizedServices =
      state.services
        .filter(
          (service) => {
            if (
              getServiceType(
                service
              ) ===
              'manutencao-outra'
            ) {
              return false
            }

            return (
              !service.category_id ||
              !knownCategoryIds.has(
                service.category_id
              )
            )
          }
        )
        .sort(
          (a, b) =>
            String(
              a.name ||
              ''
            ).localeCompare(
              String(
                b.name ||
                ''
              ),
              'pt-PT',
              {
                sensitivity:
                  'base',
              }
            )
        )

    if (
      state.serviceCategoryFilter ===
        'ALL' &&
      uncategorizedServices.length
    ) {
      const section =
        document.createElement(
          'div'
        )

      section.className =
        'public-service-category'

      const heading =
        document.createElement(
          'h3'
        )

      heading.textContent =
        'Outros'

      const list =
        document.createElement(
          'div'
        )

      list.className =
        'public-services-list'

      uncategorizedServices.forEach(
        (service) => {
          list.appendChild(
            serviceCard(
              service,
              regularMaintenance,
              otherProfessionalMaintenance
            )
          )
        }
      )

      section.appendChild(
        heading
      )

      section.appendChild(
        list
      )

      el.serviceCategories.appendChild(
        section
      )
    }

    if (
      !el.serviceCategories.children.length
    ) {
      el.serviceCategories.innerHTML =
        '<p class="public-muted">Não existem serviços disponíveis de momento.</p>'
    }
  }

  // =========================================================
  // CARTÃO DE SERVIÇO
  // =========================================================

  function serviceCard(
    service,
    regularMaintenance,
    otherProfessionalMaintenance
  ) {
    const type =
      getServiceType(
        service
      )

    const isRegularMaintenance =
      type ===
      'manutencao'

    const maintenanceIds = [
      regularMaintenance?.id,
      otherProfessionalMaintenance?.id,
    ].filter(
      Boolean
    )

    const selected =
      isRegularMaintenance
        ? maintenanceIds.some(
            (id) =>
              state
                .selectedServices
                .includes(
                  id
                )
          )
        : state
            .selectedServices
            .includes(
              service.id
            )

    const unavailable =
      service.booking_enabled ===
        false ||
      service
        .has_eligible_professional ===
        false

    const card =
      document.createElement(
        'div'
      )

    card.className =
      `public-service-card${
        selected
          ? ' selected'
          : ''
      }${
        unavailable
          ? ' unavailable'
          : ''
      }`

    // =======================================================
    // BOTÃO PRINCIPAL
    // =======================================================

    const main =
      document.createElement(
        'button'
      )

    main.type =
      'button'

    main.className =
      'public-service-main'

    main.disabled =
      unavailable

    const unavailableLabel =
      service.booking_enabled ===
      false
        ? 'Indisponível de momento'
        : service
              .has_eligible_professional ===
            false
          ? 'Sem disponibilidade de momento'
          : ''

    main.innerHTML = `
      <span class="public-check">
        ${selected ? '✓' : ''}
      </span>

      <span class="public-service-copy">

        <strong>
          ${escapeHtml(
            getDisplayName(
              service
            )
          )}
        </strong>

        ${
          getDescription(
            service
          )
            ? `
              <small>
                ${escapeHtml(
                  getDescription(
                    service
                  )
                )}
              </small>
            `
            : ''
        }

        ${
          unavailableLabel
            ? `
              <small class="public-service-unavailable-label">
                ${escapeHtml(
                  unavailableLabel
                )}
              </small>
            `
            : ''
        }

      </span>

      <span class="public-service-price">

        ${
          (() => {
            const displayPrice =
              getServiceDisplayPrice(
                service
              )

            if (
              displayPrice.mode ===
              'FROM'
            ) {
              return `
                <small
                  style="
                    display:block;
                    margin-bottom:2px;
                    font-size:.68rem;
                    color:#8d6f7e;
                    font-weight:600;
                  "
                >
                  a partir de
                </small>

                <strong>
                  ${formatPrice(
                    displayPrice.value
                  )} €
                </strong>
              `
            }

            if (
              displayPrice.mode ===
                'TOTAL' ||
              !service.promotion_id
            ) {
              return `
                <strong>
                  ${formatPrice(
                    displayPrice.value
                  )} €
                </strong>
              `
            }

            return `
              <small
                style="
                  display:block;
                  text-decoration:line-through;
                  opacity:.55;
                  font-weight:500;
                "
              >
                ${formatPrice(
                  service.price
                )} €
              </small>

              <strong>
                ${formatPrice(
                  service.promotional_price
                )} €
              </strong>

              <small
                style="
                  display:block;
                  margin-top:2px;
                  color:#8d6f7e;
                "
              >
                -${formatDiscount(
                  service.discount_percent
                )}%
              </small>
            `
          })()
        }

      </span>
    `

    main.addEventListener(
      'click',
      async () => {
        if (
          unavailable
        ) {
          return
        }

        // ===================================================
        // MANUTENÇÃO
        // ===================================================

        if (
          isRegularMaintenance
        ) {
          const currentlySelected =
            maintenanceIds.some(
              (id) =>
                state
                  .selectedServices
                  .includes(
                    id
                  )
            )

          if (
            currentlySelected
          ) {
            state.selectedServices =
              state.selectedServices.filter(
                (id) =>
                  !maintenanceIds.includes(
                    id
                  )
              )

            maintenanceIds.forEach(
              (id) => {
                delete state
                  .procedureOptions[
                    id
                  ]

                delete state
                  .selectedServiceOptions[
                    id
                  ]
              }
            )
          } else if (
            regularMaintenance
          ) {
            state.selectedServices.push(
              regularMaintenance.id
            )

            state.procedureOptions[
              regularMaintenance.id
            ] =
              false
          }
        }

        // ===================================================
        // RESTANTES SERVIÇOS
        // ===================================================

        else {
          toggleService(
            service.id
          )
        }

        await loadProfessionals()

        state.selectedSlot =
          null

        renderAll()

        await loadSlots()
      }
    )

    card.appendChild(
      main
    )

    // =======================================================
    // MANUTENÇÃO - VARIANTES
    // =======================================================

    if (
      isRegularMaintenance &&
      selected
    ) {
      const options =
        document.createElement(
          'div'
        )

      options.className =
        'public-maintenance-options'

      // -----------------------------------------------------
      // MANUTENÇÃO NORMAL
      // -----------------------------------------------------

      if (
        regularMaintenance
      ) {
        const button =
          document.createElement(
            'button'
          )

        button.type =
          'button'

        button.className =
          `public-maintenance-option${
            state
              .selectedServices
              .includes(
                regularMaintenance.id
              )
              ? ' selected'
              : ''
          }`

        button.innerHTML = `
          <span>
            Manutenção
          </span>

          <strong>
            ${formatPrice(
              regularMaintenance
                .promotion_id
                ? regularMaintenance
                    .promotional_price
                : regularMaintenance
                    .price
            )} €
          </strong>
        `

        button.addEventListener(
          'click',
          async (event) => {
            event.stopPropagation()

            state.selectedServices =
              state.selectedServices.filter(
                (id) =>
                  !maintenanceIds.includes(
                    id
                  )
              )

            state.selectedServices.push(
              regularMaintenance.id
            )

            state.procedureOptions[
              regularMaintenance.id
            ] =
              false

            maintenanceIds.forEach(
              (id) => {
                delete state
                  .selectedServiceOptions[
                    id
                  ]
              }
            )

            if (
              otherProfessionalMaintenance
                ?.id
            ) {
              delete state
                .procedureOptions[
                  otherProfessionalMaintenance
                    .id
                ]
            }

            state.selectedSlot =
              null

            await loadProfessionals()

            renderAll()

            await loadSlots()
          }
        )

        options.appendChild(
          button
        )
      }

      // -----------------------------------------------------
      // MANUTENÇÃO DE OUTRA PROFISSIONAL
      // -----------------------------------------------------

      if (
        otherProfessionalMaintenance
      ) {
        const button =
          document.createElement(
            'button'
          )

        button.type =
          'button'

        button.className =
          `public-maintenance-option${
            state
              .selectedServices
              .includes(
                otherProfessionalMaintenance
                  .id
              )
              ? ' selected'
              : ''
          }`

        button.innerHTML = `
          <span>
            Manutenção de outra profissional
          </span>

          <strong>
            ${formatPrice(
              otherProfessionalMaintenance
                .promotion_id
                ? otherProfessionalMaintenance
                    .promotional_price
                : otherProfessionalMaintenance
                    .price
            )} €
          </strong>
        `

        button.addEventListener(
          'click',
          async (event) => {
            event.stopPropagation()

            state.selectedServices =
              state.selectedServices.filter(
                (id) =>
                  !maintenanceIds.includes(
                    id
                  )
              )

            state.selectedServices.push(
              otherProfessionalMaintenance.id
            )

            state.procedureOptions[
              otherProfessionalMaintenance.id
            ] =
              false

            maintenanceIds.forEach(
              (id) => {
                delete state
                  .selectedServiceOptions[
                    id
                  ]
              }
            )

            if (
              regularMaintenance?.id
            ) {
              delete state
                .procedureOptions[
                  regularMaintenance.id
                ]
            }

            state.selectedSlot =
              null

            await loadProfessionals()

            renderAll()

            await loadSlots()
          }
        )

        options.appendChild(
          button
        )
      }

      card.appendChild(
        options
      )
    }

    // =======================================================
    // PROCEDIMENTO
    // =======================================================

    if (
      !isRegularMaintenance &&
      selected &&
      service.has_procedure_option &&
      !isMaintenance(
        service
      )
    ) {
      const options =
        document.createElement(
          'div'
        )

      options.className =
        'public-procedure-options'

      options.innerHTML = `
        <span>
          Tem procedimento?
        </span>

        <button
          type="button"
          data-value="false"
          class="${
            !state
              .procedureOptions[
                service.id
              ]
              ? 'selected'
              : ''
          }"
        >
          Não
        </button>

        <button
          type="button"
          data-value="true"
          class="${
            state
              .procedureOptions[
                service.id
              ]
              ? 'selected'
              : ''
          }"
        >
          Sim
        </button>
      `

      options
        .querySelectorAll(
          'button'
        )
        .forEach(
          (button) => {
            button.addEventListener(
              'click',
              async (event) => {
                event.stopPropagation()

                state.procedureOptions[
                  service.id
                ] =
                  button.dataset
                    .value ===
                  'true'

                state.selectedSlot =
                  null

                renderAll()

                await loadSlots()
              }
            )
          }
        )

      card.appendChild(
        options
      )
    }

    // =======================================================
    // SERVIÇO ATIVO
    // =======================================================

    const activeServiceId =
      isRegularMaintenance
        ? (
            maintenanceIds.find(
              (id) =>
                state
                  .selectedServices
                  .includes(
                    id
                  )
            ) ||
            service.id
          )
        : service.id

    // =======================================================
    // OPÇÕES DINÂMICAS
    // Tamanho / Nail Art / futuros extras
    // =======================================================

    if (
      selected
    ) {
      const groups =
        getOptionGroups(
          activeServiceId
        )

      groups.forEach(
        (group) => {
          const panel =
            document.createElement(
              'div'
            )

          panel.className =
            'public-maintenance-options public-service-extra-group'

          // -------------------------------------------------
          // TÍTULO
          // -------------------------------------------------

          const title =
            document.createElement(
              'span'
            )

          title.className =
            'public-service-extra-title'

          title.textContent =
            `${group.name}${
              group.required
                ? ' *'
                : ''
            }`

          panel.appendChild(
            title
          )

          const selectedIds =
            state
              .selectedServiceOptions[
                activeServiceId
              ]?.[
                group.id
              ] ||
            []

          // -------------------------------------------------
          // SEM OPÇÃO
          // Ex.: Sem Nail Art
          // -------------------------------------------------

          if (
            group.selection_type ===
              'SINGLE' &&
            !group.required
          ) {
            const noneButton =
              document.createElement(
                'button'
              )

            noneButton.type =
              'button'

            noneButton.className =
              `public-maintenance-option${
                selectedIds.length ===
                0
                  ? ' selected'
                  : ''
              }`

            noneButton.innerHTML = `
              <span>
                Sem ${escapeHtml(
                  group.name
                )}
              </span>
            `

            noneButton.addEventListener(
              'click',
              async (event) => {
                event.stopPropagation()

                await selectServiceOption(
                  activeServiceId,
                  group,
                  null
                )
              }
            )

            panel.appendChild(
              noneButton
            )
          }

          // -------------------------------------------------
          // OPÇÕES
          // -------------------------------------------------

          ;(
            group.options ||
            []
          ).forEach(
            (option) => {
              const button =
                document.createElement(
                  'button'
                )

              button.type =
                'button'

              const isSelected =
                selectedIds.includes(
                  option.id
                )

              button.className =
                `public-maintenance-option${
                  isSelected
                    ? ' selected'
                    : ''
                }`

              const extraPrice =
                Number(
                  option
                    .price_delta ||
                  0
                )

              // Não mostramos a duração
              // dos extras no website.
              button.innerHTML = `
                <span>
                  ${escapeHtml(
                    option.name
                  )}
                </span>

                ${
                  extraPrice >
                  0
                    ? `
                      <strong>
                        +${formatPrice(
                          extraPrice
                        )} €
                      </strong>
                    `
                    : ''
                }
              `

              button.addEventListener(
                'click',
                async (event) => {
                  event.stopPropagation()

                  await selectServiceOption(
                    activeServiceId,
                    group,
                    option.id
                  )
                }
              )

              panel.appendChild(
                button
              )
            }
          )

          card.appendChild(
            panel
          )
        }
      )
    }

    return card
  }

  // =========================================================
  // SELECIONAR / REMOVER SERVIÇO
  // =========================================================

  function toggleService(
    serviceId
  ) {
    if (
      state
        .selectedServices
        .includes(
          serviceId
        )
    ) {
      state.selectedServices =
        state.selectedServices.filter(
          (id) =>
            id !==
            serviceId
        )

      delete state
        .procedureOptions[
          serviceId
        ]

      delete state
        .selectedServiceOptions[
          serviceId
        ]
    } else {
      state.selectedServices.push(
        serviceId
      )

      state.procedureOptions[
        serviceId
      ] =
        false
    }
  }

  // =========================================================
  // RENDER PROFISSIONAIS
  // =========================================================

  function renderProfessionals() {
    if (
      state.fixedProfessional
    ) {
      state.professionals = [
        state.fixedProfessional,
      ]

      state.selectedProfessional =
        state.fixedProfessional.id

      return
    }

    if (
      !state.selectedServices.length
    ) {
      el.professionals.innerHTML =
        '<p class="public-muted">Selecione primeiro um serviço.</p>'

      return
    }

    if (
      isMultiAreaBooking()
    ) {
      const groups =
        getBookingAreaGroups()

      el.professionals.innerHTML =
        ''

      groups.forEach(
        (group) => {
          const box =
            document.createElement(
              'div'
            )

          box.className =
            'public-area-professional'

          const serviceNames =
            group.serviceIds
              .map(
                (serviceId) =>
                  state.services.find(
                    (service) =>
                      service.id ===
                      serviceId
                  )?.name
              )
              .filter(
                Boolean
              )
              .join(
                ' + '
              )

          const header =
            document.createElement(
              'div'
            )

          header.className =
            'public-area-professional__header'

          header.innerHTML = `
            <div>
              <strong>
                ${escapeHtml(
                  group.areaName
                )}
              </strong>

              <small>
                ${escapeHtml(
                  serviceNames
                )}
              </small>
            </div>
          `

          box.appendChild(
            header
          )

          const professionals =
            state
              .areaProfessionals[
                group.areaId
              ] ||
            []

          if (
            !professionals.length
          ) {
            const empty =
              document.createElement(
                'p'
              )

            empty.className =
              'public-muted'

            empty.textContent =
              'Não existem profissionais disponíveis para estes serviços.'

            box.appendChild(
              empty
            )

            el.professionals.appendChild(
              box
            )

            return
          }

          const choices =
            document.createElement(
              'div'
            )

          choices.className =
            'public-area-professional__choices'

          const selectedId =
            state
              .areaSelectedProfessionals[
                group.areaId
              ] ||
            (
              professionals.length ===
              1
                ? professionals[0].id
                : 'ANY'
            )

          // Se houver mais de uma profissional,
          // permitimos "Qualquer profissional".
          if (
            professionals.length >
            1
          ) {
            const anyButton =
              document.createElement(
                'button'
              )

            anyButton.type =
              'button'

            anyButton.className =
              `public-area-professional-choice${
                selectedId ===
                'ANY'
                  ? ' selected'
                  : ''
              }`

            anyButton.innerHTML = `
              <span class="public-professional-avatar">
                ★
              </span>

              <strong>
                Qualquer profissional
              </strong>
            `

            anyButton.addEventListener(
              'click',
              async () => {
                state
                  .areaSelectedProfessionals[
                    group.areaId
                  ] =
                  'ANY'

                state.selectedSlot =
                  null

                renderProfessionals()
                updateSummary()

                await loadSlots()
              }
            )

            choices.appendChild(
              anyButton
            )
          }

          professionals.forEach(
            (professional) => {
              const button =
                document.createElement(
                  'button'
                )

              button.type =
                'button'

              button.className =
                `public-area-professional-choice${
                  selectedId ===
                  professional.id
                    ? ' selected'
                    : ''
                }`

              const avatar =
                professional.avatar_path
                  ? getAvatarUrl(
                      professional
                        .avatar_path
                    )
                  : ''

              button.innerHTML = `
                <span class="public-professional-avatar">
                  ${
                    avatar
                      ? `
                        <img
                          src="${avatar}"
                          alt=""
                        >
                      `
                      : escapeHtml(
                          (
                            professional
                              .display_name ||
                            '?'
                          )
                            .charAt(
                              0
                            )
                            .toUpperCase()
                        )
                  }
                </span>

                <strong>
                  ${escapeHtml(
                    professional
                      .display_name
                  )}
                </strong>
              `

              button.addEventListener(
                'click',
                async () => {
                  state
                    .areaSelectedProfessionals[
                      group.areaId
                    ] =
                    professional.id

                  state.selectedSlot =
                    null

                  renderProfessionals()
                  updateSummary()

                  await loadSlots()
                }
              )

              choices.appendChild(
                button
              )
            }
          )

          box.appendChild(
            choices
          )

          el.professionals.appendChild(
            box
          )
        }
      )

      return
    }

    if (
      !state.professionals.length
    ) {
      el.professionals.innerHTML =
        '<p class="public-muted">Não existem profissionais disponíveis para este serviço.</p>'

      return
    }

    el.professionals.innerHTML =
      ''

    el.professionals.appendChild(
      professionalButton({
        id:
          'ANY',

        display_name:
          'Qualquer profissional',

        avatar_path:
          null,
      })
    )

    state.professionals.forEach(
      (professional) => {
        el.professionals.appendChild(
          professionalButton(
            professional
          )
        )
      }
    )
  }

  // =========================================================
  // BOTÃO DE PROFISSIONAL
  // =========================================================

  function professionalButton(
    professional
  ) {
    const button =
      document.createElement(
        'button'
      )

    button.type =
      'button'

    button.className =
      `public-professional-card${
        state.selectedProfessional ===
        professional.id
          ? ' selected'
          : ''
      }`

    const avatar =
      professional.avatar_path
        ? getAvatarUrl(
            professional
              .avatar_path
          )
        : ''

    button.innerHTML = `
      <span class="public-professional-avatar">

        ${
          avatar
            ? `
              <img
                src="${avatar}"
                alt=""
              >
            `
            : escapeHtml(
                professional.id ===
                  'ANY'
                  ? '★'
                  : (
                      professional
                        .display_name ||
                      '?'
                    )
                      .charAt(
                        0
                      )
                      .toUpperCase()
              )
        }

      </span>

      <strong>
        ${escapeHtml(
          professional
            .display_name
        )}
      </strong>
    `

    button.addEventListener(
      'click',
      async () => {
        // Segurança extra:
        // numa agenda individual nunca
        // permitimos trocar a profissional.
        if (
          state.fixedProfessional
        ) {
          return
        }

        state.selectedProfessional =
          professional.id

        state.selectedSlot =
          null

        renderProfessionals()

        updateSummary()

        await loadSlots()
      }
    )

    return button
  }

  // =========================================================
  // CARREGAR HORÁRIOS
  // =========================================================

  async function loadSlots() {
    showError('')

    if (
      !state.selectedServices.length
    ) {
      state.slots =
        []

      state.selectedSlot =
        null

      renderSlots()

      return
    }

    if (
      !requiredOptionsComplete()
    ) {
      state.slots =
        []

      state.selectedSlot =
        null

      el.slotsStatus.textContent =
        'Escolha as opções obrigatórias.'

      el.nextButton.hidden =
        true

      renderSlots()

      return
    }

    el.slotsStatus.textContent =
      'A procurar horários...'

    el.slots.innerHTML =
      ''

    // =======================================================
    // VÁRIAS ÁREAS
    // =======================================================

    if (
      isMultiAreaBooking()
    ) {
      try {
        const schedules =
          await buildMultiAreaSchedulesForDate(
            state.selectedDate
          )

        state.slots =
          schedules

        state.selectedSlot =
          null

        renderSlots()

        return
      } catch (error) {
        console.error(
          'Erro ao procurar sequência multi-área:',
          error
        )

        state.slots =
          []

        state.selectedSlot =
          null

        el.slotsStatus.textContent =
          ''

        showError(
          'Não foi possível carregar os horários disponíveis.'
        )

        renderSlots()

        return
      }
    }

    let data
    let error

    if (
      state.selectedProfessional ===
      'ANY'
    ) {
      const result =
        await client.rpc(
          'public_get_auto_available_slots_with_options',
          {
            p_service_ids:
              state.selectedServices,

            p_has_procedure:
              getProcedureArray(),

            p_work_date:
              state.selectedDate,

            p_option_selections:
              getOptionSelectionsPayload(),
          }
        )

      data =
        result.data

      error =
        result.error
    } else {
      const result =
        await client.rpc(
          'public_get_available_slots_with_options',
          {
            p_professional_id:
              state
                .selectedProfessional,

            p_service_ids:
              state.selectedServices,

            p_has_procedure:
              getProcedureArray(),

            p_work_date:
              state.selectedDate,

            p_option_selections:
              getOptionSelectionsPayload(),
          }
        )

      data =
        result.data

      error =
        result.error
    }

    if (error) {
      console.error(
        'Erro nos horários:',
        error
      )

      state.slots =
        []

      state.selectedSlot =
        null

      el.slotsStatus.textContent =
        ''

      showError(
        'Não foi possível carregar os horários disponíveis.'
      )

      renderSlots()

      return
    }

    state.slots =
      data || []

    state.selectedSlot =
      null

    renderSlots()
  }

  // =========================================================
  // RENDER HORÁRIOS
  // =========================================================

  function renderSlots() {
    el.slots.innerHTML =
      ''

    el.nextList.innerHTML =
      ''

    if (
      !state.selectedServices.length
    ) {
      el.slotsStatus.textContent =
        'Selecione pelo menos um serviço.'

      el.nextButton.hidden =
        true

      updateSummary()
      updateConfirmState()

      return
    }

    if (
      !state.selectedProfessional
    ) {
      el.slotsStatus.textContent =
        'Selecione uma profissional.'

      el.nextButton.hidden =
        true

      updateSummary()
      updateConfirmState()

      return
    }

    if (
      !requiredOptionsComplete()
    ) {
      el.slotsStatus.textContent =
        'Escolha as opções obrigatórias.'

      el.nextButton.hidden =
        true

      updateSummary()
      updateConfirmState()

      return
    }

    if (
      !state.slots.length
    ) {
      el.slotsStatus.textContent =
        'Sem disponibilidade para esta data.'

      el.nextButton.hidden =
        false

      el.nextButton.textContent =
        'Procurar próxima disponibilidade'

      updateSummary()
      updateConfirmState()

      return
    }

    el.slotsStatus.textContent =
      isMultiAreaBooking()
        ? 'Escolha a hora de início. Os restantes serviços serão organizados automaticamente.'
        : 'Escolha um horário'

    el.nextButton.hidden =
      true

    state.slots.forEach(
      (slot) => {
        const button =
          document.createElement(
            'button'
          )

        button.type =
          'button'

        button.className =
          `public-slot-button${
            state.selectedSlot
              ?.slot_start ===
            slot.slot_start
              ? ' selected'
              : ''
          }`

        button.textContent =
          formatTime(
            slot.slot_start
          )

        button.addEventListener(
          'click',
          () => {
            state.selectedSlot =
              slot

            renderSlots()
          }
        )

        el.slots.appendChild(
          button
        )
      }
    )

    updateSummary()
    updateConfirmState()
  }

  // =========================================================
  // PRÓXIMA DISPONIBILIDADE
  // =========================================================

  async function searchNextAvailability() {
    showError('')

    if (
      !state.selectedServices.length
    ) {
      showError(
        'Selecione primeiro um serviço.'
      )

      return
    }

    if (
      isMultiAreaBooking()
    ) {
      el.nextButton.disabled =
        true

      el.nextButton.textContent =
        'A procurar...'

      el.nextList.innerHTML =
        ''

      const currentDate =
        new Date(
          `${state.selectedDate}T12:00:00`
        )

      let found =
        null

      for (
        let offset = 1;
        offset <= 45;
        offset += 1
      ) {
        const date =
          new Date(
            currentDate
          )

        date.setDate(
          date.getDate() +
          offset
        )

        const dateString =
          getLocalDateString(
            date
          )

        try {
          const schedules =
            await buildMultiAreaSchedulesForDate(
              dateString
            )

          if (
            schedules.length
          ) {
            found = {
              date:
                dateString,

              slots:
                schedules,
            }

            break
          }
        } catch (error) {
          console.error(
            'Erro ao procurar próxima disponibilidade multi-área:',
            error
          )
        }
      }

      if (!found) {
        el.nextList.innerHTML =
          '<p class="public-muted">Não encontrámos disponibilidade nos próximos 45 dias.</p>'

        el.nextButton.disabled =
          false

        el.nextButton.textContent =
          'Procurar próxima disponibilidade'

        return
      }

      state.selectedDate =
        found.date

      el.date.value =
        found.date

      state.slots =
        found.slots

      state.selectedSlot =
        found.slots[0]

      el.nextList.innerHTML =
        ''

      renderSlots()
      updateSummary()

      el.nextButton.disabled =
        false

      el.nextButton.textContent =
        'Procurar próxima disponibilidade'

      return
    }

    if (
      !state.selectedProfessional
    ) {
      showError(
        'Selecione uma profissional.'
      )

      return
    }

    if (
      !requiredOptionsComplete()
    ) {
      showError(
        'Selecione todas as opções obrigatórias.'
      )

      return
    }

    el.nextButton.disabled =
      true

    el.nextButton.textContent =
      'A procurar...'

    el.nextList.innerHTML =
      ''

    const currentDate =
      new Date(
        `${state.selectedDate}T12:00:00`
      )

    let found =
      null

    for (
      let offset = 1;
      offset <= 45;
      offset += 1
    ) {
      const date =
        new Date(
          currentDate
        )

      date.setDate(
        date.getDate() +
        offset
      )

      const dateString =
        getLocalDateString(
          date
        )

      let data
      let error

      // -----------------------------------------------------
      // QUALQUER PROFISSIONAL
      // -----------------------------------------------------

      if (
        state.selectedProfessional ===
        'ANY'
      ) {
        const result =
          await client.rpc(
            'public_get_auto_available_slots_with_options',
            {
              p_service_ids:
                state.selectedServices,

              p_has_procedure:
                getProcedureArray(),

              p_work_date:
                dateString,

              p_option_selections:
                getOptionSelectionsPayload(),
            }
          )

        data =
          result.data

        error =
          result.error
      }

      // -----------------------------------------------------
      // PROFISSIONAL ESPECÍFICA
      // -----------------------------------------------------

      else {
        const result =
          await client.rpc(
            'public_get_available_slots_with_options',
            {
              p_professional_id:
                state
                  .selectedProfessional,

              p_service_ids:
                state.selectedServices,

              p_has_procedure:
                getProcedureArray(),

              p_work_date:
                dateString,

              p_option_selections:
                getOptionSelectionsPayload(),
            }
          )

        data =
          result.data

        error =
          result.error
      }

      if (
        error
      ) {
        console.error(
          'Erro ao procurar próxima disponibilidade:',
          error
        )

        continue
      }

      if (
        data &&
        data.length
      ) {
        found = {
          date:
            dateString,

          slots:
            data,
        }

        break
      }
    }

    el.nextList.innerHTML =
      ''

    // =======================================================
    // NÃO ENCONTROU
    // =======================================================

    if (
      !found
    ) {
      el.nextList.innerHTML =
        '<p class="public-muted">Não encontrámos disponibilidade nos próximos 45 dias.</p>'

      el.nextButton.disabled =
        false

      el.nextButton.textContent =
        'Procurar próxima disponibilidade'

      return
    }

    // =======================================================
    // MOSTRAR RESULTADO
    // =======================================================

    const row =
      document.createElement(
        'div'
      )

    row.className =
      'public-next-day'

    row.innerHTML = `
      <strong>
        ${escapeHtml(
          formatDate(
            found.date
          )
        )}
      </strong>
    `

    const buttons =
      document.createElement(
        'div'
      )

    found.slots.forEach(
      (slot) => {
        const button =
          document.createElement(
            'button'
          )

        button.type =
          'button'

        button.textContent =
          formatTime(
            slot.slot_start
          )

        button.addEventListener(
          'click',
          async () => {
            state.selectedDate =
              found.date

            state.discountCode = null
            state.discountType = null
            state.discountValue = 0
            state.discountAmount = 0
            state.discountFinalTotal = null
            state.discountSubtotal = null

            if (
              el.discountCodeMessage
            ) {
              el.discountCodeMessage.textContent =
                ''
            }

            if (
              el.discountCodeInput
            ) {
              el.discountCodeInput.value =
                ''
            }

            el.date.value =
              found.date

            state.slots =
              found.slots

            state.selectedSlot =
              slot

            el.nextList.innerHTML =
              ''

            // Atualizar promoções
            // para a nova data.
            await loadServices()

            renderServices()

            await loadProfessionals()

            renderProfessionals()

            renderSlots()

            updateSummary()
          }
        )

        buttons.appendChild(
          button
        )
      }
    )

    row.appendChild(
      buttons
    )

    el.nextList.appendChild(
      row
    )

    el.nextButton.disabled =
      false

    el.nextButton.textContent =
      'Procurar próxima disponibilidade'
  }

  // =========================================================
  // CRIAR MARCAÇÃO
  // =========================================================

  async function applyDiscountCode() {
  showError('')

  const code =
    el.discountCodeInput
      ?.value
      .trim()

  if (!code) {
    el.discountCodeMessage.textContent =
      'Introduza um código de desconto.'

    return
  }

  const subtotal =
    calculateBookingTotal()

  if (subtotal <= 0) {
    el.discountCodeMessage.textContent =
      'Selecione primeiro um serviço.'

    return
  }

  el.applyDiscountCode.disabled =
    true

  el.applyDiscountCode.textContent =
    'A validar...'

  const {
    data,
    error,
  } = await client.rpc(
    'public_validate_discount_code',
    {
      p_code:
        code,

      p_booking_date:
        state.selectedDate,

      p_subtotal:
        subtotal,
    }
  )

  el.applyDiscountCode.disabled =
    false

  el.applyDiscountCode.textContent =
    'Aplicar'

  if (
    error ||
    !data?.length
  ) {
    state.discountCode =
      null

    state.discountType =
      null

    state.discountValue =
      0

    state.discountAmount =
      0

    state.discountFinalTotal =
      null

    state.discountSubtotal =
      null

    el.discountCodeMessage.textContent =
      'Código inválido ou expirado.'

    updateSummary()

    return
  }

  const discount =
    data[0]

  state.discountCode =
    discount.code

  state.discountType =
    discount.discount_type

  state.discountValue =
    Number(
      discount.discount_value ||
      0
    )

  state.discountAmount =
    Number(
      discount.discount_amount ||
      0
    )

  state.discountFinalTotal =
    Number(
      discount.final_total ||
      0
    )

  state.discountSubtotal =
  subtotal

  el.discountCodeMessage.textContent =
    `Código ${discount.code} aplicado.`

  updateSummary()
}

  async function createBooking() {
    showError('')

    const normalizedPhone =
      normalizePhone(
        el.phone.value
      )

    if (
      !el.name.value.trim()
    ) {
      return showError(
        'Introduza o seu nome.'
      )
    }

    if (
      !/^\+[1-9][0-9]{7,14}$/.test(
        normalizedPhone
      )
    ) {
      return showError(
        'Introduza um número de telemóvel válido.'
      )
    }

    if (
      !state.selectedServices.length
    ) {
      return showError(
        'Selecione pelo menos um serviço.'
      )
    }

    if (
      !requiredOptionsComplete()
    ) {
      return showError(
        'Selecione todas as opções obrigatórias.'
      )
    }

    if (
      !state.selectedSlot
    ) {
      return showError(
        'Selecione um horário.'
      )
    }

    el.confirm.disabled =
      true

    el.confirm.textContent =
      'A confirmar...'

    // =======================================================
    // RESERVA MULTI-ÁREA
    // =======================================================

    if (
      isMultiAreaBooking()
    ) {
      if (
        state.discountCode
      ) {
        showError(
          'Para uma marcação com serviços de áreas diferentes, remova o código de desconto antes de confirmar.'
        )

        el.confirm.textContent =
          'Confirmar marcação'

        updateConfirmState()

        return
      }

      const schedule =
        state.selectedSlot
          .schedule ||
        []

      if (
        !schedule.length
      ) {
        showError(
          'Não foi possível preparar a sequência dos serviços. Escolha novamente o horário.'
        )

        el.confirm.textContent =
          'Confirmar marcação'

        updateConfirmState()

        return
      }

      const groupsPayload =
        schedule.map(
          (item) => ({
            area_id:
              item.area_id,

            service_ids:
              item.service_ids,

            has_procedure:
              item.has_procedure,

            start_at:
              item.slot_start,

            option_selections:
              item.option_selections,

            professional_id:
              item.professional_id ===
                'ANY'
                ? null
                : item.professional_id,
          })
        )

      const {
        data,
        error,
      } = await client.rpc(
        'public_create_booking_bundle_any_with_options',
        {
          p_client_name:
            el.name.value.trim(),

          p_phone_e164:
            normalizedPhone,

          p_email:
            el.email.value.trim() ||
            null,

          p_groups:
            groupsPayload,

          p_notes_client:
            el.notes.value.trim() ||
            null,
        }
      )

      if (error) {
        console.error(
          'Erro ao criar reserva multi-área:',
          error
        )

        el.confirm.textContent =
          'Confirmar marcação'

        updateConfirmState()

        if (
          String(
            error.message ||
            ''
          )
            .toLowerCase()
            .includes(
              'dispon'
            )
        ) {
          showError(
            'Um dos horários acabou de ficar indisponível. Escolha outro horário.'
          )

          await loadSlots()

          return
        }

        showError(
          error.message ||
          'Não foi possível confirmar a marcação.'
        )

        return
      }

      const result =
        data?.[0] ||
        null

      el.app.style.display =
        'none'

      el.success.hidden =
        false

      el.success.style.display =
        'block'

      hideMobileBookingBar()

      const scheduleText =
        schedule
          .map(
            (item) =>
              `${item.area_name}: ${formatTime(
                item.slot_start
              )}–${formatTime(
                item.slot_end
              )}`
          )
          .join(
            ' · '
          )

      el.success.innerHTML = `
        <div class="public-success-icon">
          ✓
        </div>

        <p class="eyebrow">
          Marcação confirmada
        </p>

        <p>
          ${escapeHtml(
            el.name.value.trim()
          )},
          a sua reserva ficou registada para
          <strong>
            ${escapeHtml(
              formatDate(
                state.selectedDate
              )
            )}
          </strong>.
        </p>

        <p>
          ${escapeHtml(
            scheduleText
          )}
        </p>

        <a
          href="/"
          class="button"
        >
          Voltar ao início
        </a>
      `

      window.scrollTo({
        top:
          0,

        behavior:
          'smooth',
      })

      return
    }

    // =======================================================
    // RESERVA NORMAL — UMA ÁREA
    // =======================================================

    if (
      !state.selectedProfessional
    ) {
      el.confirm.textContent =
        'Confirmar marcação'

      updateConfirmState()

      return showError(
        'Selecione uma profissional.'
      )
    }

    const automatic =
      state.selectedProfessional ===
      'ANY'

    const rpcName =
      automatic
        ? 'public_create_booking_any_with_discount'
        : 'public_create_booking_with_discount'

    const commonArgs = {
      p_client_name:
        el.name.value.trim(),

      p_phone_e164:
        normalizedPhone,

      p_email:
        el.email.value.trim() ||
        null,

      p_service_ids:
        state.selectedServices,

      p_has_procedure:
        getProcedureArray(),

      p_start_at:
        state
          .selectedSlot
          .slot_start,

      p_notes_client:
        el.notes.value.trim() ||
        null,

      p_option_selections:
        getOptionSelectionsPayload(),

      p_discount_code:
        state.discountCode ||
        null,
    }

    const rpcArgs =
      automatic
        ? commonArgs
        : {
            ...commonArgs,

            p_professional_id:
              state
                .selectedProfessional,
          }

    const {
      data,
      error,
    } = await client.rpc(
      rpcName,
      rpcArgs
    )

    if (error) {
      console.error(
        'Erro ao criar marcação:',
        error
      )

      el.confirm.textContent =
        'Confirmar marcação'

      updateConfirmState()

      if (
        String(
          error.message ||
          ''
        )
          .toLowerCase()
          .includes(
            'dispon'
          )
      ) {
        showError(
          'Este horário acabou de ficar indisponível. Escolha outro horário.'
        )

        await loadSlots()

        return
      }

      showError(
        error.message ||
        'Não foi possível confirmar a marcação.'
      )

      return
    }

    const result =
      data?.[0] ||
      null

    let professionalName =
      ''

    if (
      state.fixedProfessional
    ) {
      professionalName =
        state.fixedProfessional
          .display_name
    } else if (
      automatic
    ) {
      professionalName =
        result
          ?.professional_name ||
        'Profissional atribuída'
    } else {
      professionalName =
        state.professionals.find(
          (professional) =>
            professional.id ===
            state.selectedProfessional
        )?.display_name ||
        'Profissional'
    }

    el.app.style.display =
      'none'

    el.success.hidden =
      false

    el.success.style.display =
      'block'

    hideMobileBookingBar()

    el.success.innerHTML = `
      <div class="public-success-icon">
        ✓
      </div>

      <p class="eyebrow">
        Marcação confirmada
      </p>

      <p>

        ${escapeHtml(
          el.name.value.trim()
        )},

        a sua marcação ficou registada

        para

        <strong>
          ${escapeHtml(
            formatDate(
              state.selectedDate
            )
          )}
        </strong>

        às

        <strong>
          ${escapeHtml(
            formatTime(
              state
                .selectedSlot
                .slot_start
            )
          )}
        </strong>

        com

        <strong>
          ${escapeHtml(
            professionalName
          )}
        </strong>.

      </p>

      <a
        href="/"
        class="button"
      >
        Voltar ao início
      </a>
    `

    window.scrollTo({
      top:
        0,

      behavior:
        'smooth',
    })
  }

  // =========================================================
  // RESUMO
  // =========================================================

  // =========================================================
  // BARRA FIXA MOBILE — RESUMO + CONTINUAR
  // =========================================================

  function setupMobileBookingBar() {
    if (
      document.getElementById(
        'mobile-booking-bar'
      )
    ) {
      return
    }

    const bar =
      document.createElement(
        'div'
      )

    bar.id =
      'mobile-booking-bar'

    bar.className =
      'mobile-booking-bar'

    bar.hidden =
      true

    bar.innerHTML = `
      <div class="mobile-booking-bar__summary">
        <strong id="mobile-booking-count">
          0 serviços
        </strong>

        <span id="mobile-booking-total">
          0,00 €
        </span>
      </div>

      <button
        id="mobile-booking-continue"
        type="button"
        class="mobile-booking-bar__button"
      >
        Continuar
      </button>
    `

    document.body.appendChild(
      bar
    )

    document
      .getElementById(
        'mobile-booking-continue'
      )
      ?.addEventListener(
        'click',
        handleMobileBookingContinue
      )

    updateMobileBookingBar()
  }

  function hideMobileBookingBar() {
    const bar =
      document.getElementById(
        'mobile-booking-bar'
      )

    if (bar) {
      bar.hidden =
        true
    }

    document.body.classList.remove(
      'has-mobile-booking-bar'
    )
  }

  function scrollToBookingElement(
    element
  ) {
    if (!element) {
      return
    }

    const target =
      element.closest(
        '.public-booking-card'
      ) ||
      element

    target.scrollIntoView({
      behavior:
        'smooth',

      block:
        'start',
    })
  }

  function getMobileBookingNextStep() {
    // Ainda faltam opções obrigatórias.
    if (
      !requiredOptionsComplete()
    ) {
      return {
        label:
          'Continuar',

        target:
          el.serviceCategories,
      }
    }

    // Sem horário escolhido:
    // levar diretamente para data/horários.
    if (
      !state.selectedSlot
    ) {
      return {
        label:
          'Continuar',

        target:
          el.date ||
          el.slots,
      }
    }

    const normalizedPhone =
      normalizePhone(
        el.phone.value
      )

    const clientComplete =
      Boolean(
        el.name.value.trim()
      ) &&
      /^\+[1-9][0-9]{7,14}$/.test(
        normalizedPhone
      )

    // Horário escolhido, faltam dados.
    if (
      !clientComplete
    ) {
      return {
        label:
          'Continuar',

        target:
          el.name,
      }
    }

    // Tudo preenchido.
    return {
      label:
        'Confirmar',

      target:
        el.confirm,

      confirm:
        true,
    }
  }

  function handleMobileBookingContinue() {
    const next =
      getMobileBookingNextStep()

    if (
      next.confirm
    ) {
      if (
        !el.confirm.disabled
      ) {
        el.confirm.click()
      }

      return
    }

    scrollToBookingElement(
      next.target
    )

    if (
      next.target &&
      (
        next.target.tagName ===
          'INPUT' ||
        next.target.tagName ===
          'TEXTAREA'
      )
    ) {
      window.setTimeout(
        () => {
          next.target.focus({
            preventScroll:
              true,
          })
        },
        450
      )
    }
  }

  function updateMobileBookingBar() {
    const bar =
      document.getElementById(
        'mobile-booking-bar'
      )

    if (!bar) {
      return
    }

    const count =
      state.selectedServices.length

    if (
      count === 0 ||
      el.app?.style.display ===
        'none'
    ) {
      hideMobileBookingBar()
      return
    }

    bar.hidden =
      false

    document.body.classList.add(
      'has-mobile-booking-bar'
    )

    const countElement =
      document.getElementById(
        'mobile-booking-count'
      )

    const totalElement =
      document.getElementById(
        'mobile-booking-total'
      )

    const button =
      document.getElementById(
        'mobile-booking-continue'
      )

    if (countElement) {
      countElement.textContent =
        count === 1
          ? '1 serviço'
          : `${count} serviços`
    }

    const subtotal =
      calculateBookingTotal()

    const total =
      (
        state.discountCode &&
        state.discountFinalTotal !==
          null
      )
        ? Number(
            state.discountFinalTotal
          )
        : subtotal

    if (totalElement) {
      totalElement.textContent =
        `${formatPrice(
          total
        )} €`
    }

    const next =
      getMobileBookingNextStep()

    if (button) {
      button.textContent =
        next.label

      button.classList.toggle(
        'is-confirm',
        Boolean(
          next.confirm
        )
      )

      button.disabled =
        Boolean(
          next.confirm &&
          el.confirm.disabled
        )
    }
  }

  function calculateBookingTotal() {
  const selected =
    state.selectedServices
      .map(
        (id) =>
          state.services.find(
            (service) =>
              service.id === id
          )
      )
      .filter(Boolean)

  return selected.reduce(
    (
      sum,
      service
    ) => {
      const procedureExtra =
        state
          .procedureOptions[
            service.id
          ]
          ? Number(
              service
                .procedure_price_delta ||
              0
            )
          : 0

      const baseTotal =
        Number(
          service.price ||
          0
        ) +
        procedureExtra

      const discount =
        service.promotion_id
          ? Number(
              service
                .discount_percent ||
              0
            )
          : 0

      const discountedBase =
        discount > 0
          ? baseTotal *
            (
              1 -
              discount /
                100
            )
          : baseTotal

      const optionExtra =
        getOptionExtraPrice(
          service.id
        )

      return (
        sum +
        discountedBase +
        optionExtra
      )
    },
    0
  )
}

  function updateSummary() {
    const selected =
      state.selectedServices
        .map(
          (id) =>
            state.services.find(
              (service) =>
                service.id ===
                id
            )
        )
        .filter(
          Boolean
        )

    // =======================================================
    // SERVIÇOS + OPÇÕES
    // =======================================================

    el.summaryServices.textContent =
      selected.length
        ? selected
            .map(
              (service) => {
                const selectedIds =
                  getSelectedOptionIds(
                    service.id
                  )

                const optionLabels =
                  getOptionGroups(
                    service.id
                  )
                    .flatMap(
                      (group) =>
                        (
                          group.options ||
                          []
                        )
                          .filter(
                            (option) =>
                              selectedIds.includes(
                                option.id
                              )
                          )
                          .map(
                            (option) =>
                              option.name
                          )
                    )

                if (
                  optionLabels.length
                ) {
                  return `${getDisplayName(
                    service
                  )} (${optionLabels.join(
                    ', '
                  )})`
                }

                return getDisplayName(
                  service
                )
              }
            )
            .join(
              ' + '
            )
        : '—'

    // =======================================================
    // PROFISSIONAL
    // =======================================================

    if (
      state.fixedProfessional
    ) {
      el.summaryProfessional.textContent =
        state.fixedProfessional
          .display_name
    } else if (
      isMultiAreaBooking()
    ) {
      const labels =
        getBookingAreaGroups().map(
          (group) => {
            const selectedId =
              state
                .areaSelectedProfessionals[
                  group.areaId
                ] ||
              'ANY'

            const professional =
              (
                state
                  .areaProfessionals[
                    group.areaId
                  ] ||
                []
              ).find(
                (item) =>
                  item.id ===
                  selectedId
              )

            return `${group.areaName}: ${
              selectedId ===
              'ANY'
                ? 'Qualquer profissional'
                : (
                    professional
                      ?.display_name ||
                    'Profissional'
                  )
            }`
          }
        )

      el.summaryProfessional.textContent =
        labels.join(
          ' · '
        )
    } else if (
      state.selectedProfessional ===
      'ANY'
    ) {
      el.summaryProfessional.textContent =
        state.selectedServices.length
          ? 'Qualquer profissional'
          : '—'
    } else {
      el.summaryProfessional.textContent =
        state.professionals.find(
          (professional) =>
            professional.id ===
            state.selectedProfessional
        )?.display_name ||
        '—'
    }

    // =======================================================
    // DATA
    // =======================================================

    el.summaryDate.textContent =
      state.selectedDate
        ? formatDate(
            state.selectedDate
          )
        : '—'

    // =======================================================
    // HORA
    // =======================================================

    el.summaryTime.textContent =
      state.selectedSlot
        ? (
            isMultiAreaBooking()
              ? `${formatTime(
                  state.selectedSlot
                    .slot_start
                )} – ${formatTime(
                  state.selectedSlot
                    .slot_end
                )}`
              : formatTime(
                  state
                    .selectedSlot
                    .slot_start
                )
          )
        : '—'

    // =======================================================
    // PREÇO
    //
    // (serviço + procedimento) - promoção
    // +
    // extras sem desconto
    // =======================================================

    const subtotal =
  calculateBookingTotal()

if (
  state.discountCode &&
  state.discountSubtotal !== null &&
  Math.abs(
    subtotal -
    state.discountSubtotal
  ) > 0.001
) {
  state.discountCode =
    null

  state.discountType =
    null

  state.discountValue =
    0

  state.discountAmount =
    0

  state.discountFinalTotal =
    null

  state.discountSubtotal =
    null

  if (
    el.discountCodeMessage
  ) {
    el.discountCodeMessage.textContent =
      'A marcação foi alterada. Aplique novamente o código.'
  }
}

if (
  state.discountCode &&
  state.discountFinalTotal !== null
) {
  el.subtotalSummary.hidden =
    false

  el.discountSummary.hidden =
    false

  el.summarySubtotal.textContent =
    `${formatPrice(
      subtotal
    )} €`

  el.summaryDiscount.textContent =
    `-${formatPrice(
      state.discountAmount
    )} €`

  el.summaryPrice.textContent =
    `${formatPrice(
      state.discountFinalTotal
    )} €`
} else {
  el.subtotalSummary.hidden =
    true

  el.discountSummary.hidden =
    true

  el.summaryPrice.textContent =
    `${formatPrice(
      subtotal
    )} €`
}

    updateConfirmState()
    updateMobileBookingBar()
  }

  // =========================================================
  // BOTÃO CONFIRMAR
  // =========================================================

  function updateConfirmState() {
    const normalizedPhone =
      normalizePhone(
        el.phone.value
      )

    el.confirm.disabled =
      !(
        el.name.value.trim() &&
        /^\+[1-9][0-9]{7,14}$/.test(
          normalizedPhone
        ) &&
        state
          .selectedServices
          .length &&
        requiredOptionsComplete() &&
        (
          isMultiAreaBooking() ||
          state.selectedProfessional
        ) &&
        state.selectedSlot
      )

    updateMobileBookingBar()
  }

  // =========================================================
  // PROCEDIMENTO
  // =========================================================

  function getProcedureArray() {
    return state
      .selectedServices
      .map(
        (id) =>
          Boolean(
            state
              .procedureOptions[
                id
              ]
          )
      )
  }

  // =========================================================
  // TELEFONE
  // =========================================================

  function normalizePhone(
    value
  ) {
    let cleaned =
      String(
        value ||
        ''
      )
        .trim()
        .replace(
          /[()\s-]/g,
          ''
        )

    if (
      cleaned.startsWith(
        '00'
      )
    ) {
      cleaned =
        `+${cleaned.slice(
          2
        )}`
    }

    if (
      /^\d{9}$/.test(
        cleaned
      )
    ) {
      cleaned =
        `+351${cleaned}`
    }

    if (
      /^351\d{9}$/.test(
        cleaned
      )
    ) {
      cleaned =
        `+${cleaned}`
    }

    return cleaned
  }

  // =========================================================
  // NORMALIZAÇÃO TEXTO
  // =========================================================

  function normalizeText(
    value = ''
  ) {
    return value
      .trim()
      .toLowerCase()
      .normalize(
        'NFD'
      )
      .replace(
        /[\u0300-\u036f]/g,
        ''
      )
  }

  // =========================================================
  // TIPO DE SERVIÇO
  // =========================================================

 function getServiceType(service) {
  const name =
    normalizeText(
      service?.name ||
      ''
    )

  if (
    name ===
    'manutencao'
  ) {
    return 'manutencao'
  }

  if (
    name ===
    'manutencao de outra profissional'
  ) {
    return 'manutencao-outra'
  }

  return 'servico'
}

  function isMaintenance(
    service
  ) {
    return getServiceType(
      service
    ).startsWith(
      'manutencao'
    )
  }

  // =========================================================
  // NOME VISÍVEL
  // =========================================================

 function getDisplayName(
  service
) {
  return (
    service?.name ||
    'Serviço'
  )
}

  // =========================================================
  // DESCRIÇÃO
  // =========================================================

  function getDescription(
    service
  ) {
    const name =
      normalizeText(
        service?.name
      )

    if (
      name ===
        'pedicure' ||
      name ===
        'pedicure premium'
    ) {
      return (
        service
          ?.description ||
        ''
      )
    }

    return ''
  }

  // =========================================================
  // AVATAR
  // =========================================================

  function getAvatarUrl(
    avatarPath
  ) {
    if (
      !avatarPath
    ) {
      return ''
    }

    const {
      data,
    } =
      client.storage
        .from(
          'professional-avatars'
        )
        .getPublicUrl(
          avatarPath
        )

    return (
      data?.publicUrl ||
      ''
    )
  }

  // =========================================================
  // DATA LOCAL
  // =========================================================

  function getLocalDateString(
    date
  ) {
    const year =
      date.getFullYear()

    const month =
      String(
        date.getMonth() +
        1
      ).padStart(
        2,
        '0'
      )

    const day =
      String(
        date.getDate()
      ).padStart(
        2,
        '0'
      )

    return `${year}-${month}-${day}`
  }

  // =========================================================
  // FORMATAR DATA
  // =========================================================

  function formatDate(
    value
  ) {
    if (
      !value
    ) {
      return '—'
    }

    return new Intl
      .DateTimeFormat(
        'pt-PT',
        {
          weekday:
            'long',

          day:
            'numeric',

          month:
            'long',

          year:
            'numeric',
        }
      )
      .format(
        new Date(
          `${value}T12:00:00`
        )
      )
  }

  // =========================================================
  // FORMATAR HORA
  // =========================================================

  function formatTime(
    value
  ) {
    if (
      !value
    ) {
      return '—'
    }

    return new Intl
      .DateTimeFormat(
        'pt-PT',
        {
          hour:
            '2-digit',

          minute:
            '2-digit',
        }
      )
      .format(
        new Date(
          value
        )
      )
  }

  // =========================================================
  // FORMATAR PREÇO
  // =========================================================

  function formatPrice(
    value
  ) {
    return Number(
      value ||
      0
    ).toLocaleString(
      'pt-PT',
      {
        minimumFractionDigits:
          2,

        maximumFractionDigits:
          2,
      }
    )
  }

  // =========================================================
  // FORMATAR DESCONTO
  // =========================================================

  function formatDiscount(
    value
  ) {
    return Number(
      value ||
      0
    ).toLocaleString(
      'pt-PT',
      {
        maximumFractionDigits:
          2,
      }
    )
  }

  // =========================================================
  // ERROS
  // =========================================================

  function showError(
    message
  ) {
    if (
      !el.error
    ) {
      return
    }

    if (
      !message
    ) {
      el.error.textContent =
        ''

      el.error.hidden =
        true

      return
    }

    el.error.textContent =
      message

    el.error.hidden =
      false
  }

  // =========================================================
  // ESCAPE HTML
  // =========================================================

  function escapeHtml(
    value
  ) {
    return String(
      value ??
      ''
    )
      .replace(
        /&/g,
        '&amp;'
      )
      .replace(
        /</g,
        '&lt;'
      )
      .replace(
        />/g,
        '&gt;'
      )
      .replace(
        /"/g,
        '&quot;'
      )
      .replace(
        /'/g,
        '&#039;'
      )
  }
})()
